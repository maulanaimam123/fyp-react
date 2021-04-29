# Numerical Deconvolutor of Analytical Profiles

Welcome to "Numerical Deconvolutor of Analytical Profiles".\
This is my final year project (FYP) created to perform reverse-convolutional effect on profile data (SEM, TEM, etc.).\
This project is build on React for the front-end and Python (Flask) for the back-end.

## Getting Started

There are several steps to get this app running:
1. Install NodeJS and Python
    Follow [NodeJS](https://nodejs.org/en/download/) and [Python](https://www.python.org/downloads/) installation guides for Windows.\

2. Install React requirements
    Install React requirements by performing following command in the terminal/cmd out of the project directory:
    ```bash
    npm install
    ```

3. Install Tesseract software
    Tesseract is a Optical Character Recognition (OCR) software to recognize text in the image.\
    Please download and install Tesseract v.4.1.0 for Windows 10 64-bit installation from [here](https://digi.bib.uni-mannheim.de/tesseract/) \
    Download the file with name of "tesseract-ocr-w64-setup-v4.1.0.20190314.exe".\
    For more information, refer to unofficial guide [here](https://medium.com/quantrium-tech/installing-and-using-tesseract-4-on-windows-10-4f7930313f82). \

3. Install Python requirements
    Install python requirements by opening terminal/cmd in the project directory and running this command:
    ```bash
    pip install -r requirements.txt
    ```
    Installing under virtual environment container is preferred.\

4. Install PyCasinoTools, PyMonteCarlo, and PyMonteCarloCasino2
    Download following repositories:
    - [PyCasinoTools] (https://github.com/drix00/pycasinotools)
    - [PyMonteCarlo](https://github.com/pymontecarlo/pymontecarlo)
    - [PyMonteCarloCasino2] (https://github.com/pymontecarlo/pymontecarlo-casino2)
    And put them under this directory: "api/dependencies".\
    Put the template files (VerticalLayers30.sim) under this directory: "api/dependencies/pymontecarlo-casino2/pymontecarlo_casino2/templates". \
    This is just a regular .sim file with 30 horizontal layers (including substrates). \
    If you need more regions, you can create it using CASINO v.2.5.0 software and change the line TEMPLATE_NUM_REGIONS = 30 in the file "api/simulation.py" to the number of regions you want.\
    Install all three packages by running this command under the project directory:
    ```bash
    install-dependencies.bat
    ```

5. Start!
    Finally! To run this projects, start the back-end by opening the terminal/cmd under this project directory and entering command below:
    ``` bash
    start-server.bat
    ```
    After that, start the front-end by opening another terminal/cmd and entering this command:
    ```bash
    npm start
    ```
    You are good to go! Open a browser and go to the link: '/localhost:3000'

