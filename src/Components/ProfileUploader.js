import React, { useState } from 'react'
import { Typography, Button, makeStyles, Stepper,
         Step, StepLabel, StepContent, Paper, Tab } from '@material-ui/core'
import Dropzone from 'react-dropzone'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { useCustomContext } from './Context'
import Spinner from './spinner/Spinner'
import axios from 'axios'
import img from './images/image1.jpg'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    stepLabel: {
        fontSize: '1.2rem'
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    assetContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    dropAreaStyle: {
        border: '3px dashed #abc4ff',
        height: 250,
        width: 600,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    },
    uploadedAreaStyle: {
        border: '3px dashed gray',
        height: 250,
        width: 600,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
  }));

function getSteps() {
    return ['Create an excel file', 'Set up line profile data', 'Upload the excel file'];
}

function Uploader() {
    const classes = useStyles()
    const [ uploadingStatusExcel, setUploadingStatusExcel ] = useState('idle')
    const [ fileName, setFileName ] = useState('')
    const handleDrop = (acceptedFiles) => {
        setUploadingStatusExcel('uploading')
        setFileName(acceptedFiles[0].name)
        console.log('uploading excel...')
        const formData = new FormData()
        formData.append('file', acceptedFiles[0])
        axios
            .post('/upload_excel', formData)
            .then(data => {
                console.log(data)
                setUploadingStatusExcel('done')
            })
            .catch(err => {
                setUploadingStatusExcel('idle')
                console.log('Oops, something went wrong...')
            })
    }

    switch (uploadingStatusExcel) {
        case 'idle':
            return (
                <Dropzone
                    onDrop={handleDrop}
                    >
                    {({ getRootProps, getInputProps }) => (
                        <section>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <div className={classes.dropAreaStyle}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                    startIcon={<InsertDriveFileIcon />}>
                                    Upload
                                </Button>
                            </div>
                        </div>
                        </section>
                    )}
                </Dropzone>
        );
        case 'uploading': return (
            <Spinner />
        );
        case 'done': return (
            <div className={classes.uploadedAreaStyle}>
                <div style={{display:'block'}}>
                    <Typography>Done! - {fileName}</Typography>
                </div>
                <div>
                    <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => setUploadingStatusExcel('idle')}
                        >
                            Delete
                        </Button>
                </div>
            </div>
        )
    }
}

function GetStepContent({ step }) {
    const classes = useStyles()

    switch (step) {
        case 0:
            return (
                <div>
                    <Typography>Create an excel file with a title format of <strong>(SAMPLE_NAME)-(ENERGY)keV.xlsx</strong></Typography>
                    <Typography>Where:</Typography>
                    <Typography style={{textIndent: '2rem'}}><strong>SAMPLE_NAME</strong> - The name of your sample</Typography>
                    <Typography style={{textIndent: '2rem'}}><strong>ENERGY</strong> - The beam energy in keV.</Typography>
                    <Typography>For example: <strong>mount_agung-15.0keV.xlsx</strong></Typography>
                    <br/>
                </div>
            );
        case 1:
            return (
                <div>
                    <Typography>Put in the line profile data together with the column name as follow:</Typography>
                    <Typography style={{textIndent: '2rem'}}><strong>POSITION</strong> - Beam relative position in <strong>micrometer</strong>, starting from zero.</Typography>
                    <Typography style={{textIndent: '2rem'}}><strong>TOTAL</strong> - Total weight percentage of all atomic components.</Typography>
                    <Typography style={{textIndent: '2rem'}}><strong>XX AT%</strong> - Atomic percentage of each individual component, XX is the atomic symbol e.g. Mg, O, Fe, S</Typography>
                    <div className={classes.assetContainer}>
                        <img
                            src={img}
                            width='80%'
                            alt='Excel File Setting for Line Profile Data'
                        />
                    </div>
                </div>
            );
        case 2:
            return (
                <div>
                    <Typography>Drop the excel file into the box below to upload</Typography>
                    <div className={classes.assetContainer}>
                        <Uploader />
                    </div>
                </div>
            );
      default:
        return 'Unknown step';
    }
  }

function Instruction() {
    const classes = useStyles();
    const [activeStep, setActiveStep] = useState(0);
    const instructions = getSteps();
    const { setStep } = useCustomContext()

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handlePrevPage = () => {
        setStep(step => step - 1)
    }

    const handleFinish = () => {
        setStep(step => step + 1)
    }

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {instructions.map((label, index) => (
                <Step key={label}>
                    <StepLabel classes={{ label: classes.stepLabel }}>{label}</StepLabel>
                    <StepContent>
                    < GetStepContent step={index} />
                    <div className={classes.actionsContainer}>
                        <div>
                        <Button
                            variant={activeStep === 0 ? 'contained' : 'outlined'}
                            color={activeStep === 0 ? 'secondary' : 'default'}
                            onClick={activeStep === 0 ? handlePrevPage : handleBack}
                            className={classes.button}
                        >
                            {activeStep === 0 ? 'Previous Page' : 'Back' }
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={activeStep === instructions.length - 1 ? handleFinish : handleNext}
                            className={classes.button}
                        >
                            {activeStep === instructions.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                        </div>
                    </div>
                    </StepContent>
                </Step>
                ))}
            </Stepper>
            {activeStep === instructions.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                <Typography>All instructions completed - you&apos;re finished</Typography>
                <Button onClick={handleReset} className={classes.button}>
                    Reset
                </Button>
                </Paper>
            )}
        </div>
    )
}

export default function ProfileUploader() {
    return (
        <div style={{border: '1px solid black', background:'white', padding: 15}}>
            <Typography variant='h5'>Upload Line Profile Data</Typography>
            <Instruction />
        </div>
    )
}
