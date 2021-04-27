import numpy as np
import pandas as pd
import re

THICKNESS = 'THICKNESS'
POSITION = 'POSITION'
BEAM_POSITION = 'BEAM_POSITION'
REGION_NAME = 'REGION_NAME'
TOTAL = 'TOTAL'
MIN_AT_PCT = 0.1

def read_csv(path):
    df = pd.read_csv(path)
    return df

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
    length = df[POSITION].nunique()
    if length < 10:
        return False, length

    return True, length

def detect_outliers(df):
    '''
    utility function to detect outliers in a dataframe.
    input: dataframe
    output: boolean dataframe, with True indicates outlier values
    '''
    Q1 = df.quantile(0.25)
    Q3 = df.quantile(0.75)
    IQR = Q3 - Q1
    outliers = (df < (Q1 - 1.5 * IQR)) | (df > (Q3 + 1.5 * IQR))
    return outliers

def check_nan(row):
    return row.isnull().values.any()

def impute(df):
    '''
    Utility function to impute all data in a row that has NaN to NaN, except the position (POSITION)
    input: df - dataframe which outliers is replaced with NaN
    Output: imputed - dataframe where outliers row is filled with NaN but the POSITION
    '''
    # Extracting list of columns
    columns = list(df.columns)
    columns.remove(POSITION)
    
    # Separating position and non-position data
    position_data = df[POSITION]
    non_position_data = df[columns]
    
    # Replace each row non-position data with NaN if NaN exists in that row
    non_position_data.loc[non_position_data.isnull().any(axis=1), :] = np.nan
    
    # Concatenating both data together
    return pd.concat([position_data, non_position_data], axis = 1)

def fix_end(df, is_start = True):
    # 1. get the mean
    mean_value = df.mean(axis = 0)
    
    # 2. Capturing position
    row =  df.iloc[0 if is_start else -1]
    position = row[POSITION]
    
    # 3. Replacing with mean value
    mean_value[POSITION] = position
    df.iloc[0 if is_start else -1] = mean_value
    
    return df

def clean_ends(df):
    '''
    utility function to remove outliers on both ends
    of a dataframe
    input: dataframe
    output: cleaned dataframe with outliers omitted on both ens
    '''
    start = df[:5]
    mid = df[5:-5]
    end = df[-5:]
    
    if check_nan(start.iloc[0]):
        start = fix_end(start, is_start = True)
    if check_nan(end.iloc[-1]):
        end = fix_end(end, is_start = False)
    
    return pd.concat([start, mid, end])

def clean_irrelevant_data(df):
    '''
    Function to drop element where average percentage is less than 0.1%
    '''
    average = dict(df.mean())
    average.pop(POSITION)
    average.pop(TOTAL)
    deleted_cols = [el for el, val in average.items() if val < MIN_AT_PCT]
    deleted_cols.append(TOTAL)
    df = df.drop(deleted_cols, axis = 1)

    return df

def get_element(string):
    '''
    Helper function to parse element symbol from a string
    '''
    components = string.split(' ')
    for comp in components:
        if comp != '':
            return comp

def change_columns(df):
    '''
    Process columns to delete AT%
    '''
    cols = list(df.columns)
    new_cols = []
    for col in cols:
        if col.endswith('AT%'):
            new_cols.append(get_element(col))
        else:
            new_cols.append(col)
    df.columns = new_cols
    return df

def create_thickness(df):
    '''
    Add thickness df for each region
    Starting and ending regions are omitted
    '''
    positions = df[POSITION]
    position_diff_backward = positions.diff()
    position_diff_forward = - positions.diff(periods = -1)
    df[THICKNESS] = (position_diff_backward + position_diff_forward) / 2
    return df

def create_beam_position(df):
    '''
    Add beam position df for each region (in the middle of each region)
    '''
    base_distance = (df[THICKNESS].sum() + df.loc[0:1, POSITION].sum())/ 2
    df[BEAM_POSITION] = df[POSITION] - base_distance
    return df

def create_region_name(df):
    df[REGION_NAME] = ['substrate_start', *[f'region_{i}' for i in range(1, len(df) - 1)], 'substrate_end']
    return df

def cleanup_data(df):
    '''
    Function to cleanup line profile data.
    Following steps are taken:
    1. Remove negative values (error, replace w/ 0)
    2. Detect outliers, fill with NaN
    3. Impute outliers whole row with NaN
    4. Check value on both ends, use average of 5 to replace NaN
    5. Interpolate remaining missing values
    6. Rounding reading to 3 decimals
    7. Delete unnecessary column (average < 0.1%)
    8. Change columns to remove 'AT%'
    9. Add thickness data
    10. Add beam position data
    11. Add region names
    Final columns: [POSITION, ATOMIC PERCENTAGE (Mg, Al, Si, O...),
                    THICKNESS, BEAM_POSITION, REGION_NAME]
    '''
    # step 1
    df[df < 0] = 0

    # step 2
    outliers = detect_outliers(df)
    df = df.where((1 - outliers).astype('bool'))

    # step 3
    imputed = impute(df)

    # step 4
    df = clean_ends(imputed)

    # step 5
    df = df.interpolate()

    # step 6
    df = df.round(3)

    # step 7
    df = clean_irrelevant_data(df)

    # step 8
    df = change_columns(df)

    # step 9
    df = create_thickness(df)

    # step 10
    df = create_beam_position(df)

    # step 11
    df = create_region_name(df)
    return df

def convert_to_dict(df, removed_cols = []):
    '''
    Function to convert dataframe to dict
    '''
    cols = list(df.columns)
    for col in removed_cols:
        if col in cols:
            cols.remove(col)

    selected_df = df[cols]
    
    return selected_df.to_json(orient='records')