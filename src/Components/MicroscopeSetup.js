import React, { useState, useEffect } from 'react'
import { useCustomContext } from './Context'
import Spinner from './spinner/Spinner'
import axios from 'axios'
import { Button, TextField, Box, Grid, Typography, Toolbar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

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

export default function MicroscopeSetup() {
    const { setStep } = useCustomContext()
    const classes = useStyles()
    const [isStillFetching, setStillFetching] = useState(true)
    const [sampleParams, setSampleParams] = useState({})

    useEffect(() => {
        console.log('fetching...')
        axios
            .get('/get_sample_params')
            .then(res => {
                setSampleParams(res.data)
                setStillFetching(false)
                console.log(res.data)
                console.log('Fetching data finished...')
            })
            .catch(err => console.log(err))
    }, [])

    return (
        <div style={{border: '1px solid black', background:'white', padding: 15, width: '60%'}}>
            <Typography variant='h5'>Microscope Settings</Typography>
            <Toolbar />
            <div className={classes.base}>
                { isStillFetching ? <Spinner /> :
                <form noValidate autoComplete="off" id='mainForm'>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField
                                id='sampleName'
                                name='sampleName'
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
                                defaultValue={ sampleParams.beamDiameter.toFixed(1) }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='beamAngle'
                                label='Sample Tilt Angle (in tetha)'
                                variant='outlined'
                                type='number'
                                className={classes.item}
                                size='small'
                                defaultValue='0'
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='numberOfBeam'
                                label='Number of Beam'
                                variant='outlined'
                                type='number'
                                className={classes.item}
                                size='small'
                                defaultValue={ sampleParams.numberOfBeam }
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
                                    // onClick={() => setStep(step => step + 1)
                                >
                                    Next
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
                }
            </div>
        </div>
    )
}
