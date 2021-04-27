import React, { useState, useEffect } from 'react'
import { useCustomContext } from './Context'
import Spinner from './spinner/Spinner'
import axios from 'axios'
import { Button, TextField, Box, Grid, Typography, Toolbar, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import CompositionViewer from './CompositionViewer'

const useStyles = makeStyles((theme) => ({
    buttonGroup: {
        display: 'flex',
        justifyContent:'flex-end',
        marginTop: theme.spacing(1)
    },
    button: {
        margin: 2
    },
    base: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        width: '100%'
    },
    item: {
        padding: theme.spacing(1),
        width: "100%",
        marginTop: theme.spacing(1)
    }
  }));

export default function AdditionalSetting() {
    const { step, setStep } = useCustomContext()
    const classes = useStyles()
    const [isStillFetching, setStillFetching] = useState(true)
    const [sampleParams, setSampleParams] = useState({})

    const boardStyle = {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 15,
        background: 'white',
        borderRadius: 10
    }

    useEffect(() => {
        console.log('fetching...')
        axios
            .get('/get_sample_params')
            .then(res => {
                setSampleParams(res.data)
                setStillFetching(false)
                console.log(res.data.data)
                console.log(res.data)
                console.log('Fetching data finished...')
            })
            .catch(err => console.log(err))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = e.target
        const dataValue = {
            'sample_name': data.sampleName.value,
            'number_of_electron': data.numberOfElectron.value,
            'energy': data.energy_keV.value,
            'beam_diameter': data.beamDiameter.value,
            'density_start': data.densityStart.value,
            'density_end': data.densityEnd.value
        }
        console.log('confirming parameters', dataValue)
        
        const formData = new FormData()
        for (const [key, value] of Object.entries(dataValue)) {
            formData.append(key, value);
        }

        const response = await axios.post('/confirm_parameters', formData)

        setStillFetching(false)
        setStep(step + 1)
    }

    return (
        <Paper style={boardStyle}>
            <Typography variant='h5'>Additional Settings</Typography>
            <div className={classes.base}>
                { isStillFetching ? <Spinner /> :
                <div>
                <CompositionViewer data={JSON.parse(sampleParams.data)}/>
                <form noValidate autoComplete="off"  onSubmit={handleSubmit}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                id='sampleName'
                                label='Sample Name'
                                variant='outlined'
                                className={classes.item}
                                size='small'
                                required
                                defaultValue={ sampleParams.sampleName }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='numberOfElectron'
                                label='Number of Electron (per beam)'
                                variant='outlined'
                                type='number'
                                className={classes.item}
                                size='small'
                                required
                                defaultValue={ 5000 }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='energy_keV'
                                label='Energy (keV)'
                                variant='outlined'
                                type='number'
                                className={classes.item}
                                size='small'
                                required
                                defaultValue={ sampleParams.energy }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='beamDiameter'
                                label='Beam Diameter (nm)'
                                variant='outlined'
                                type='number'
                                className={classes.item}
                                size='small'
                                required
                                defaultValue={ sampleParams.beamDiameter }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='densityStart'
                                label='Density Start (kg/m3)'
                                variant='outlined'
                                type='number'
                                focused
                                className={classes.item}
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='densityEnd'
                                label='Density End (kg/m3)'
                                variant='outlined'
                                type='number'
                                className={classes.item}
                                size='small'
                            />
                        </Grid>
                        <Toolbar />
                        <Grid item xs={12}>
                            <Box className={classes.buttonGroup}>
                                <Button
                                    className={classes.button}
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setStep(step => step - 1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    className={classes.button}
                                    variant="contained"
                                    color="primary"
                                    type='submit'
                                >
                                    Next
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
                </div>
                }
            </div>
        </Paper>
    )
}
