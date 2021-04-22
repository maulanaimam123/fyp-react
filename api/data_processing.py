import numpy as np
import pandas as pd

def read_file(file):
    '''
    Function to read pandas DataFrame from request file
    input: 
    file - FileObject from request
    output:
    df - pandas DataFrame
    '''
    df = pd.read_excel(file)
    return df
