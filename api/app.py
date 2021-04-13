from flask import Flask, request, Response
from flask_cors import CORS
from PIL import Image
from werkzeug.utils import secure_filename
import numpy as np
import os


app = Flask(__name__)
CORS(app)
big_session = {}


@app.route('/')
def greeting():
    return "Hello World!"

@app.route('/upload_image', methods = ['POST'])
def upload_image():
    resp = Response
    try:
        file = request.files['file']
        img = Image.open(file).convert('RGB')
        big_session['image'] = np.array(img)[:,:,::-1] # convert RGB to BGR for opencv
        return resp
    except:
        resp.status_code = 400
        return resp



@app.route('/process_image', methods = ['GET', 'POST'])
def process_image():
    try:
        imageURL = request.form['imageURL']
        print(imageURL)
        return '200'
    except:
        return '400'