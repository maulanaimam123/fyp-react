from flask import Flask, request, Response, jsonify, abort, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from image_processing import *
from data_processing import read_file
import uuid
import json


app = Flask(__name__)
app.secret_key = 'maulana-fyp'
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

        is_length_good = check_length(df)
        assert is_length_good, 'Length Error - Make sure that data have minimum 10 entries from different positions'

        # Saving dataframe to tmp for later use
        df.to_csv(os.path.join(TEMP_PATH_CSV, f'{session_id}.csv'))

        # Return OK response
        return jsonify(success=True)

    except AssertionError as err:
        return str(err), 400