import numpy as np
import pandas as pd
import re

def read_file(file, file_name):
    '''
    Function to read pandas DataFrame from request file
    input: 
    file - FileObject from request
    output:
    df - pandas DataFrame
    '''
    assert file_name.endswith(('csv', 'xlsx', 'xls')), 'Please input excel or csv file only!'
    if file_name.endswith('csv'):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)
    return df

def get_energy_reading_keV(string):
    match = re.search(r'\d+(?:\.\d+)+kV|\d+(?:\.\d+)+keV', string)[0]
    energy_string = re.findall(r'\d+(?:\.\d+)?', match)[0]
    energy_keV = float(energy_string) if len(energy_string) > 0 else 0.00
    return energy_keV

def get_scalebar_reading_nm(string):
    match = re.search(r'\d+nm|\d+um', string)[0]
    numbers = float(re.findall(r'\d+(?:\.\d+)?', match)[0])
    if match.endswith('um'):
        numbers *= 1000
    return numbers

def get_sample_name(string):
    return string.split('-')[0]

def get_info(file_name):
    energy = get_energy_reading_keV(file_name)
    sample_name = get_sample_name(file_name)
    return sample_name, energy

def get_atomic_columns(column_list):
    pattern = re.compile('.*AT%')
    atomic_percentages = list(filter(pattern.match, column_list))
    return atomic_percentages

def check_columns(df):
    '''
    Function to check dataframe columns.
    Return True if columns contain all:
    POSITION, TOTAL, XX AT%
    '''
    TOTAL = 'TOTAL'
    POSITION = 'POSITION'
    column_list = list(df.columns)
    print(column_list)
    if TOTAL not in column_list or POSITION not in column_list:
        return False

    
    atomic_percentages = get_atomic_columns(column_list)
    if len(atomic_percentages) == 0:
        return False
    
    return True

def check_length(df):
    '''
    Function to check number of unique value in POSITION
    Minimum: 10.
    '''
    POSITION = 'POSITION'

    if df[POSITION].nunique() < 10:
        return False

    return True