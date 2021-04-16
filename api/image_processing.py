import numpy as np
from PIL import Image
import math

def read_image_response(file):
    img = Image.open(file)
    return img

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

def get_beam_diameter(intensities):
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
    return float(FWHM)
