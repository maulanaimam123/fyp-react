from flask import Flask, request, Response, jsonify, abort, session
from flask_cors import CORS
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename
import os
from image_processing import *
from data_processing import *
from simulation import *
import uuid
import json
import time


app = Flask(__name__)
app.secret_key = 'maulana-fyp'
socketio = SocketIO(app, cors_allowed_origins='*')
TEMP_PATH_CSV = './tmp/line_profile/'
TEMP_PATH_SIMULATION = './tmp/simulation/'
CORS(app)

@app.route('/upload_image', methods = ['POST'])
def upload_image():
    '''
    End point to get data from image: energy (keV)
    and scalebar dimension (nm)
    Return response {energy_keV, scalebar_nm}
    '''
    time.sleep(2)
    img = read_image_response(request)
    text = get_text(img)
    try:
        session['energy_keV'] = get_energy_reading_keV(text)
        session['scalebar_nm'] = get_scalebar_reading_nm(text)
        session['scalebar_size'] = get_scalebar_relative_size(img)
        return jsonify(success=True)
    except:
        print('Data not found')
        abort(404, description = 'Energy and Scalebar Dimension Not Found')

@app.route('/manual_input', methods = ['POST'])
def calibrate():
    '''
    End point to create user-defined scalebar
    '''
    lines = json.loads(request.form['lines'])
    line_avg_length = calculate_avg_length(lines)
    session['energy_keV'] = float(request.form['energy'])
    session['scalebar_nm'] = float(request.form['scalebar'])
    session['scalebar_size'] = line_avg_length
    print(session['energy_keV'])
    print(session['scalebar_nm'])
    print(session['scalebar_size'])
    return jsonify(success=True)

@app.route('/get_profile', methods = ['POST'])
def get_profile():
    '''
    End point to get line profile intensity
    Called when onMouseUp event triggered
    Return response {intensity, diameter}
    '''
    img = read_image_response(request)
    W, _ = img.size
    line_params = json.loads(request.form['line'])
    intensities = get_profile_intensity(img, line_params)
    beam_diameter = get_beam_diameter(  intensities,
                                        dimension_nm = session['scalebar_nm'],
                                        dimension_pixel = session['scalebar_size'] * W)
    print('intensities are ', intensities, type(intensities[0]))
    print('beam diameter: ', beam_diameter)
    return {'intensities': intensities, 'diameter': beam_diameter}

@app.route('/set_diameter', methods = ['POST'])
def set_diameter():
    '''
    End point to save beam diameter in the server session
    '''
    diameters = json.loads(request.form['diameters'])
    session['beam_diameter'] = min(diameters)
    return jsonify(success=True)

@app.route('/upload_excel', methods = ['POST'])
def upload_excel():
    file = request.files['file']
    file_name = request.form['fileName']
    try:
        # Reading excel to pandas dataframe
        df = read_file(file, file_name)
    
        # Creating session ID
        session_id = str(uuid.uuid4())
        session['session_id'] = session_id

        # Reading other information
        sample_name, energy = get_info(file_name)
        assert sample_name != '' and energy != 0.00, 'File Name Error - Unable to read sample name and energy, please follow the naming format!'
        session['sample_name'] = sample_name
        session['energy'] = energy

        # Check quality of dataframe
        is_column_good = check_columns(df)
        assert is_column_good, 'Column Error - Make sure that all columns are correct!'

        is_length_good, length = check_length(df)
        assert is_length_good, 'Length Error - Make sure that data have minimum 10 entries from different positions'
        session['number_of_beam'] = length

        # cleaning up the data
        df = cleanup_data(df)

        # Saving dataframe to tmp for later use
        df.to_csv(os.path.join(TEMP_PATH_CSV, f'{session_id}.csv'), index=False)

        # Return OK response
        return jsonify(success=True)

    except AssertionError as err:
        return str(err), 400

@app.route('/get_sample_params', methods = ['GET'])
def get_sample_params():
    # read excel file
    df = read_csv(os.path.join(TEMP_PATH_CSV, f'{session["session_id"]}.csv'))

    # convert DataFrame to Dict
    dict_data = convert_to_dict(df, removed_cols=[THICKNESS, BEAM_POSITION, REGION_NAME])
    print(dict_data)

    return {
        'sampleName': session['sample_name'],
        'energy': session['energy'],
        'sessionID': session['session_id'],
        'beamDiameter': round(float(session['beam_diameter']), 1),
        'data': dict_data
    }

@app.route('/confirm_parameters', methods = ['POST'])
def confirm_parameters():
    print('--------------------confirming parameters----------------')
    session['sample_name'] = request.form['sample_name']
    session['number_of_electron'] = int(request.form['number_of_electron'])
    session['energy'] = float(request.form['energy'])
    session['beam_diameter'] = float(request.form['beam_diameter'])
    session['density_start'] = request.form['density_start']
    session['density_end'] = request.form['density_end']

    if session['density_start'] == '':
        session['density_start'] = None
    else:
        session['density_start'] = float(session['density_start'])

    if session['density_end'] == '':
        session['density_end'] = None
    else:
        session['density_end'] = float(session['density_end'])

    print(f'density value is {[session["density_start"], session["density_end"]]}')

    return jsonify(success=True)

def set_status(string):
    socketio.emit('progress_change', string)

@app.route('/dummy_simulation', methods = ['GET'])
def dummy_simulation():
    set_status('simulation started')
    time.sleep(1)
    set_status('simulation running')
    time.sleep(2)
    set_status('simulation still running')
    time.sleep(1)
    set_status('simulation is done')
    set_status('done')

@app.route('/simulation', methods = ['GET'])
def start_simulation():
    '''
    End point to preprocess data, simulate, and correcting
    line profile data.
    '''
    
    print('-------------------------------')
    print('       starting process        ')
    print('-------------------------------')
    set_status('Process started...')
    time.sleep(0.3)

    # Reading data
    print('reading data...')
    set_status('Reading line profile data...')
    df = pd.read_csv(os.path.join(TEMP_PATH_CSV, f'{session["session_id"]}.csv'))
    set_status('Reading data complete')
    
    # Creating simulation options
    print('creating model...')
    set_status('Creating simulation options...')
    model_options = build_model_options(df, session)
    homogeneous_options = build_homogeneous_options(df, session)
    set_status('Options creation complete')

    # Simulation
    print('simulating...')
    set_status('Starting simulation...')

    df_homogeneous = pd.DataFrame()
    df_model = pd.DataFrame()

    for i, (homogeneous_option, model_option) in enumerate(zip(homogeneous_options, model_options)):
        set_status(f'Simulating... ({i + 1} / {len(model_options)})')
        df_homogeneous, df_model = simulate(df_homogeneous,
                                            df_model,
                                            homogeneous_option,
                                            model_option)          

    # Data analysis
    print('analysing data...')
    before, after = correct_profile(df, df_homogeneous, df_model)
    before.to_csv(os.path.join(TEMP_PATH_SIMULATION, 'before.csv'), index=False)
    after.to_csv(os.path.join(TEMP_PATH_SIMULATION, 'after.csv'), index=False)
    socketio.emit('finish_simulation', {'dataBefore': convert_to_dict(before), 'dataAfter': convert_to_dict(after)})

    return jsonify(success=True)

if __name__ == '__main__':
    socketio.run(app)