from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from image_processing import *
import json


app = Flask(__name__)
CORS(app)


@app.route('/get_profile', methods = ['POST'])
def get_profile():
    '''
    End point to get line profile intensity
    Called when onMouseUp event triggered
    Return array of intensity and beam diameter
    '''
    file = request.files['file']
    line_params = json.loads(request.form['line'])
    img = read_image_response(file)
    intensities = get_profile_intensity(img, line_params)
    beam_diameter = get_beam_diameter(intensities)
    print('intensities are ', intensities, type(intensities[0]))
    print('beam diameter: ', beam_diameter)
    return {'intensities': intensities, 'diameter': beam_diameter}