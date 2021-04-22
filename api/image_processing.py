import numpy as np
from PIL import Image
import math
import cv2
import pytesseract as tess
from data_processing import *

def read_image_response(request):
    file = request.files['file']
    img = Image.open(file)
    return img

def get_text(img):
    '''
    using pytesseract to detect text in image
    input: PIL Image - input image
    output: str - all text in image
    '''
    return tess.image_to_string(img)

def get_scalebar_relative_size(pil_img):
    # convert PIL Image to cv2 image
    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    # take roi 10% from bottom
    H, W, _ = img.shape
    img = img[int(0.9*H):, :, :]

    # convert to binary
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (3,3), 0)
    _, binary = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # detect contour, look for the biggest squarish object
    contours, hierarchy = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    squared_contours = []
    for c in contours:
        if not cv2.isContourConvex(c):
            continue
        x,y,w,h = cv2.boundingRect(c)
        box_area = w*h
        cnt_area = cv2.contourArea(c)
        fill_ratio = cnt_area / box_area
        if fill_ratio > 0.8:
            squared_contours.append([cnt_area, w])
    squared_contours.sort(key = lambda x: x[0])
    return squared_contours[-1][1] / W

def calculate_length(line):
    '''
    Helper function to calculate line length
    input:
    line - dict {x1, y1, x2, y2}
    output:
    length - float sqrt((x2-x1)^2 + (y2-y1)^2)
    '''
    x1 = line['x1']
    x2 = line['x2']
    y1 = line['y1']
    y2 = line['y2']
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

def calculate_avg_length(lines):
    '''
    Function to calculate average line's length
    input:
    lines - [lineParams] where:
    lineParams - dict {x1, y1, x2, y2} xs and ys are relative coordinates
    output:
    avg_length - float average euclidean length of all lines
    '''
    lengths = np.array([calculate_length(line) for line in lines])
    return lengths.mean()

def get_profile_intensity(img, line):
    '''
    Function to get line profile intensity from image
    img: PIL Image RGB
    line: {x1, y1, x2, y2} all is [0,1] relative coordinates
    '''
    # convert image to grayscale
    gs_img = np.array(img.convert('L'))

    # get absolute line coordinates
    H, W = gs_img.shape
    x1 = max(int(line['x1'] * W), 0)
    y1 = max(int(line['y1'] * H), 0)
    x2 = min(int(line['x2'] * W), W)
    y2 = min(int(line['y2'] * H), H)

    # get profile
    num = int(np.hypot(x2 - x1, y2 - y1))
    rows, cols = np.linspace(y1, y2, num), np.linspace(x1, x2, num)
    profiles = gs_img[rows.astype(np.int), cols.astype(np.int)]
    return [int(i) for i in list(profiles)]

def get_beam_diameter(intensities, dimension_pixel = 20, dimension_nm = 10):
    '''
    Function to get beam diameter of a convoluted step profile
    std = (Cmax - Cmin) / (sqrt(2*pi)*grad), grad is the steepest gradient
    FWHM = 2 * sqrt(2*ln(2)) * std
    '''
    np_intensities = np.array(intensities)
    d_intensities = np_intensities[1:] - np_intensities[:-1] # d(Intensity)/dx
    grad = max(d_intensities) # gradient at the steepest point
    std = (max(np_intensities) - min(np_intensities)) / (math.sqrt(2*math.pi)*grad)
    FWHM = 2 * math.sqrt(2 * np.log(2)) * std
    return float(FWHM * dimension_nm / dimension_pixel)
