import React, { useState } from 'react'
import { Button, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useCustomContext } from './Context'
import CompositionViewer from './CompositionViewer'
import io from 'socket.io-client'
import Spinner from './spinner/Spinner'
import axios from 'axios'

const useStyles = makeStyles((theme) => ({
    centerContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    button: {
        width: 100,
        margin: theme.spacing(1)
    },
    title: {
        marginBottom: theme.spacing(3)
    }
  }));

const endPoint = 'http://localhost:5000'
const socket = io.connect(`${endPoint}`)

export default function Simulation() {
    const classes = useStyles()
    const { step, setStep } = useCustomContext()
    const [isStarted, setStarted] = useState(false)
    const [progress, setProgress] = useState('Initializing Process...')
    const [result, setResult] = useState({})
    socket.on('progress_change', currProgress => setProgress(currProgress))
    socket.on('finish_simulation', ({ dataBefore, dataAfter }) => {
        setProgress('done')
        setResult({dataBefore: JSON.parse(dataBefore), dataAfter: JSON.parse(dataAfter)})
    })

    const boardStyle = {
        width: '90%',
        height: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 15,
        background: 'white',
        borderRadius: 10
    }

    const handleSave = () => {
        return
    }

    return (
        <Paper style={boardStyle}>
            {
                isStarted?
                    <div className={classes.centerContainer}>
                        {progress === 'done'?
                        <div className={classes.centerContainer}>
                            <Typography variant='h5' className={classes.title}>
                                Profile Correction is Done!
                            </Typography>
                            <CompositionViewer 
                                dataBefore={result.dataBefore}
                                dataAfter={result.dataAfter}/>
                            <Button
                                className={classes.button}
                                variant='contained'
                                color='primary'
                                onClick={handleSave}>
                                Save
                            </Button>
                            <Button
                                className={classes.button}
                                variant='outlined'
                                color='secondary'
                                onClick={() => setStep(step - 1) }
                            >
                                Back
                            </Button>
                        </div> :
                        <Spinner message={progress}/>
                        }
                    </div> :
                    <div className={classes.centerContainer}>
                        <Typography variant='h5' className={classes.title}>
                            Profile Correction
                        </Typography>
                        <Button
                            className={classes.button}
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                setStarted(true)
                                axios.get('/simulation')
                            }}
                        >
                            Start!
                        </Button>
                        <Button
                            className={classes.button}
                            variant='outlined'
                            color='secondary'
                            onClick={() => setStep(step - 1) }
                        >
                            Back
                        </Button>
                    </div>
            }
        </Paper>
    )
}
