import os
import math
import numpy as np
import pandas as pd
import asyncio
from mendeleev import element
from colormap import rgb2hex
from sklearn.preprocessing import StandardScaler
from pymontecarlo_casino2.program import Casino2Program
from pymontecarlo.options.beam.gaussian import GaussianBeamBuilder, GaussianBeam
from pymontecarlo.options.detector.photon import PhotonDetector
from pymontecarlo.options.analysis.photonintensity import PhotonIntensityAnalysis
from pymontecarlo.options.material import Material
from pymontecarlo.options.sample import VerticalLayerSample, SubstrateSample
from pymontecarlo.options.particle import Particle
from pymontecarlo.options.options import OptionsBuilder
from pymontecarlo_casino2.exporter import Casino2Exporter
from casinotools.fileformat.casino2 import File

# Defining variables
NUM_OF_ELECTRON = 5000
MIN_THICKNESS = 1e-12
MIN_DENSITY = 1e-4
EPSILON = 1e-12 # For safe division
TEMPLATE_NUM_REGIONS = 30 # based on the available template.
                          # if you want something larger, create a dummy template (.sim file)
                          # with as many regions as you want (include substrates on both ends), then change this number

POSITION = 'POSITION' # in micrometer (um)
THICKNESS = 'THICKNESS' # in micrometer (um)
REGION_NAME = 'REGION_NAME'
TOTAL = 'TOTAL'
BEAM_POSITION = 'BEAM_POSITION' # still in micrometer (um)

CASINO_PATH = './dependencies/pymontecarlo-casino2/pymontecarlo_casino2/casino2/'
CASINO_EXEC = 'wincasino2_64.exe'
CASINO_BACK_PATH = '../../../../'
TEMP_PATH_SIMULATION = './tmp/simulation/'
SIM_FILE_NAME = 'options.sim'
CAS_FILE_NAME = 'options.cas'

# Utility functions
def generate_colors(rgb1 = (0,255,0), rgb2 = (0,0,255), steps = 0):
    '''
    Function to generate colors of the materials
    return list of colors of length = steps + 1
    '''
    colors = [ rgb1 ]
    r1, g1, b1 = rgb1
    r2, g2, b2 = rgb2
    rdelta, gdelta, bdelta = (r2-r1)/steps, (g2-g1)/steps, (b2-b1)/steps
    for step in range(steps):
        r1 += rdelta
        g1 += gdelta
        b1 += bdelta
        colors.append((int(r1), int(g1), int(b1)))
    return [rgb2hex(*color) for color in colors] # steps + 1 in length

def generate_densities(elements_data, density_start = None, density_end = None):
    '''
    Function to generate densities of materials
    if one density is not specified, return [None]*len(data)
    else: return linear combination of the densities, length = len(data)
    '''
    # if any or both densities are not specified, return None
    if not (density_start and density_end):
        return [None]*len(elements_data)
    
    # Otherwise, return array of densities, determined by linear similarity of elements
    # 1. Standardise values using StandardScaler to remove magnitude dependencies
    scaler = StandardScaler()
    transformed = scaler.fit_transform(elements_data)
    
    # 2. Create start, end, and density (end - start) vectors
    start = transformed[0]
    end = transformed[-1]
    density_vector = end - start
    
    # 3. Interpolate based density based on dot product of density vector and (data[i] - start) vector
    composition_vector = transformed - start
    delta_vector = np.dot(composition_vector, density_vector) / np.linalg.norm(density_vector) ** 2
    densities = density_start + delta_vector * (density_end - density_start)
    
    return list(densities)

def get_elements_list(data):
    '''
    Function to get list of elements in the data from dataframe
    '''
    all_cols = list(data.columns)
    all_cols.remove(POSITION)
    if THICKNESS in all_cols:
        all_cols.remove(THICKNESS)
    if BEAM_POSITION in all_cols:
        all_cols.remove(BEAM_POSITION)
    if REGION_NAME in all_cols:
        all_cols.remove(REGION_NAME)
    if TOTAL in all_cols:
        all_cols.remove(TOTAL)
    return all_cols

def get_elements_data(data):
    '''
    Functions to extract element-only data from dataframe
    '''
    cols = get_elements_list(data)
    elements_data = data[cols]
    return elements_data

def to_weight_fraction(composition):
    '''
    Function to convert atomic percentage to weight percentage
    input: composition - dict({'Mg': 0.242, 'O': 0.214, ...}) --> atomic percentage, atomic symbol as keys
    output: dict({24: 0.521, 16: 0.213, 8: 0.112, ...}) --> weight percentage, atomic no. as keys
    '''
    total_mass = 0
    wt_fractions = {}
    for el_string, at_fraction in composition.items():
        el = element(el_string.strip(' '))
        el_weight = el.atomic_weight * at_fraction
        wt_fractions[el.atomic_number] = el_weight
        total_mass += el_weight
    for el_number, wt_fraction in wt_fractions.items():
        wt_fractions[el_number] = wt_fraction / total_mass
    return wt_fractions

def generate_end_materials(elements_data, colors, density_start = None, density_end = None):
    material_start = Material(
                                name = 'substrate_start',
                                composition = to_weight_fraction(dict(elements_data.iloc[0])), # create the first region
                                density_kg_per_m3 = density_start,
                                color = colors[0] if colors else None)
    material_end = Material(
                                name = 'substrate_end',
                                composition = to_weight_fraction(dict(elements_data.iloc[-1])), # create the last region
                                density_kg_per_m3 = density_end,
                                color = colors[-1] if colors else None)
    return material_start, material_end

def create_analysis():
    detector = PhotonDetector(name='detector_1', elevation_rad=math.radians(40))
    photon_analysis = PhotonIntensityAnalysis(detector)
    return photon_analysis

def create_program(num_of_trajectory = 5000):
    program = Casino2Program(num_of_trajectory if num_of_trajectory > 2000 else NUM_OF_ELECTRON) # minimum 2000 trajectories
    return program

def build_options(samples, beams, analysis, program):
    options_builder = OptionsBuilder()
    options_builder.add_program(program)
    for sample in samples:
        options_builder.add_sample(sample)
    for beam in beams:
        options_builder.add_beam(beam)
    options_builder.add_analysis(analysis)
    options = options_builder.build()
    return options


# Functions to create model options
def create_model_sample(data, density_start = None, density_end = None):
    elements_data = get_elements_data(data)
    
    colors = generate_colors(steps = len(data) - 1)
    densities = generate_densities(elements_data, density_start, density_end)
    
    material_start, material_end = generate_end_materials(elements_data, colors, density_start, density_end)
    
    sample = VerticalLayerSample(material_start, material_end)
    
    # Iterate through all regions
    for i in range(1, len(data) - 1): # create the remaining regions (in the middle)
        density = densities[i]
        color = colors[i]
        material = Material(
                            name = f'region_{i}',
                            composition = to_weight_fraction(dict(elements_data.iloc[i])),
                            density_kg_per_m3 = density,
                            color = color)
        sample.add_layer(material, thickness_m = data[THICKNESS].iloc[i] / 1e6) # thickness is in micrometer
        
    # creating dummy materials to match template
    dummy_material = Material.from_formula('H', color = None, density_kg_per_m3 = MIN_DENSITY)
    for i in range(TEMPLATE_NUM_REGIONS - len(data)):
        sample.add_layer(dummy_material, thickness_m = MIN_THICKNESS)
    
    return sample

def create_model_beams(data, energy_keV = 15.0, beam_diameter_m = 20e-9):
    beam_builder = GaussianBeamBuilder()
    beam_builder.particles.add(Particle.ELECTRON)
    beam_builder.add_diameter_m(beam_diameter_m)
    beam_builder.add_energy_keV(energy_keV)
    for pos in list(data[BEAM_POSITION]):
        beam_builder.positions.add((pos / 1e6, 0)) # (x = pos[i], y = 0)
                                                    # divided by 1e6 bcs position is in micrometer, needs to be in meter
    
    beams = beam_builder.build()
    return beams


# Functions to create homogeneous options
def create_homogeneous_sample(data, density_start = None, density_end = None):
    '''
    Function to create a list of substrate samples for Xray signal reference
    input: dataframe of atomic fractions at various positions
    output: list[Substrate]
    '''
    elements_data = get_elements_data(data)
    
    colors = generate_colors(steps = len(data) - 1)
    densities = generate_densities(elements_data, density_start, density_end)

    # 1. Creating materials at both ends
    material_start, material_end = generate_end_materials(elements_data, colors, density_start, density_end)
    materials = [material_start, material_end]
    
     # 2. Iterate through all regions, create the material representations
    for i in range(1, len(data) - 1):
        density = densities[i]
        color = colors[i]
        material = Material(
                            name = f'region_{i}',
                            composition = to_weight_fraction(dict(elements_data.iloc[i])),
                            density_kg_per_m3 = density,
                            color = color)
        materials.append(material)
        
    # 3. Creating substrate sample from the materials
    substrate_list = [SubstrateSample(mat) for mat in materials]

    return substrate_list

def create_homogeneous_beam(energy_keV = 15, beam_diameter_m = 20e-9):
    beam = GaussianBeam(energy_eV = 1000*energy_keV, diameter_m = beam_diameter_m) # default position is at x = 0 nm
    return beam


# Main functions to build options
def build_homogeneous_options(df, session):
    '''
    Function to create homogeneous simulation options of samples
    at beam location of 0.00 nm coordinate.
    '''
    homogeneous_samples = create_homogeneous_sample( df,
                                                     session['density_start'],
                                                     session['density_end'])
    beam = create_homogeneous_beam( energy_keV=session['energy'],
                                    beam_diameter_m=session['beam_diameter']*1e-9) # session['beam_diameter'] is in nm
    analysis = create_analysis()
    program = create_program(session['number_of_electron'])

    homogeneous_options = build_options(homogeneous_samples, [beam], analysis, program)
    return homogeneous_options

def build_model_options(df, session):
    '''
    Function to create model simulation options of samples
    at beam location specified in the df
    '''
    model_sample = create_model_sample( data = df,
                                        density_start = session['density_start'],
                                        density_end = session['density_end'])
    model_beams = create_model_beams(   data = df,
                                        energy_keV = session['energy'],
                                        beam_diameter_m = session['beam_diameter']*1e-9) # beam diameter is still in nm, convert to m
    analysis = create_analysis()
    program = create_program(session['number_of_electron'])

    model_options = build_options([model_sample], model_beams, analysis, program)
    return model_options


# Functions to perform the simulations
def get_file_path_string():
    return os.path.join(CASINO_BACK_PATH, TEMP_PATH_SIMULATION[2:], SIM_FILE_NAME) # relative to casino2.exe 

def get_region_name(simdata, pos):
    regions = simdata.getRegionOptions().getRegions()
    for region in regions:
        start, end = region.Parametre[:2]
        if start <= pos <= end:
            return region.Name

def extract_simulation_data(file_path):
    # Reading file
    casfile = File.File()
    casfile.readFromFilepath(file_path)
    
    # Loading data
    simdata = casfile.getResultsFirstSimulation()
    simops = simdata.getSimulationOptions()
    
    # Parsing data
    beam_position_nm = simops.PositionF_X
    total_intensities = simdata.getTotalXrayIntensities()
    region_name = get_region_name(simdata, beam_position_nm)
    K_intensities = {}
    for element_no, lines in total_intensities.items():
       K_intensities[element_no] = lines['K']['Emitted'] if 'K' in lines.keys() else np.nan
    intensity_data = {element(el_no).symbol: el_intensity for el_no, el_intensity in K_intensities.items()}
    return (region_name, intensity_data)

def export_simulate_extract(df, option):
    '''
    Helper function to perform simulations.
    Following are done:
    1. Export to .sim file
    2. Simulate the .sim file to get .cas file
    3. Read simulation data from .cas file
    '''
    # step 1
    exporter = Casino2Exporter()
    asyncio.run(exporter.export(option, TEMP_PATH_SIMULATION))

    # step 2
    file_path_string = get_file_path_string()
    os.chdir(CASINO_PATH)
    os.system(f'{CASINO_EXEC} -batch {file_path_string}')
    os.chdir(CASINO_BACK_PATH)

    # step 3
    region_name, intensity_data = extract_simulation_data(os.path.join(TEMP_PATH_SIMULATION, CAS_FILE_NAME))
    intensity_data[REGION_NAME] = region_name
    df = df.append(intensity_data, ignore_index=True)
    if 'H' in df.columns:
        df.drop(['H'], axis = 1, inplace = True)
    df = df.fillna(0)

    return df

def simulate(df_homogeneous, df_model, homogeneous_option, model_option):
    '''
    Function to perform simulation and comparing model vs homogeneous data
    This function perform following things in order:
    1. Export, simulate, extract data from model option
    2. Export, simulate, extract data from homogeneous option
    3. Compare them and get the corrected profile data
    '''
    # export, simulate, extract for model option
    df_model = export_simulate_extract(df_model, model_option)

    # export, simulate, extract for homogeneous option
    df_homogeneous = export_simulate_extract(df_homogeneous, homogeneous_option)

    return df_homogeneous, df_model

# Functions to correct profile
def get_correction_factor(model_data, homogeneous_data):
    """
    Function to get correction factor, formulated by:
    factor = (Ih + (Ih - Im)) / Ih
    where Ih: homogeneous intensities, Im: simulated intensities
    """
    Im = model_data.set_index(REGION_NAME).sort_index()
    Ih = homogeneous_data.set_index(REGION_NAME).sort_index()
    
    print('================= XRay intensities: model, homogeneous =============')
    print(Im.head())
    print(Ih.head())
    print('=====================================================================')
    print('')
    return (Ih + (Ih - Im)) / (Ih + EPSILON) # epsilon for safety incase division by 0

def get_corrected_profile(profile_data, correction):
    '''
    Function to get corrected profile given initial data
    and correction factors
    '''
    profile_by_name = profile_data.set_index(REGION_NAME).sort_index()
    corrected_profile = profile_by_name[list(correction.columns)] * correction
    corrected_profile[POSITION] = profile_by_name[POSITION]
    return corrected_profile.sort_values(POSITION).reset_index()

def normalize_elements(df):
    '''
    Function to normalize atom percentages to sum up to 100%.
    '''
    elements_data = get_elements_data(df).copy()
    elements_list = list(elements_data.columns)
    non_elements_list = [col for col in df.columns if col not in elements_list]

    elements_data['total_at'] = elements_data.sum(axis=1)
    for el in elements_list:
        elements_data[el] = elements_data[el]*100 / elements_data['total_at']
    
    return pd.concat([df[non_elements_list], elements_data[elements_list]], axis=1)

def correct_profile(df, df_homogeneous, df_model):
    correction_factor = get_correction_factor(df_model, df_homogeneous)
    corrected_profile = normalize_elements(get_corrected_profile(df, correction_factor))

    print('************ Correction Factor, Corrected Profile ***********')
    print(correction_factor.head())
    print(corrected_profile.head())
    print('*************************************************************')
    print('')
    return df, corrected_profile # brefore, after