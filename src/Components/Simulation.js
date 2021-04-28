import React, { useState } from 'react'
import { Button, Typography, Paper, Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles';
import { useCustomContext } from './Context'
import CompositionViewer from './CompositionViewer'
import io from 'socket.io-client'
import Spinner from './spinner/Spinner'
import axios from 'axios'
import FileDownload from 'js-file-download'

const useStyles = makeStyles((theme) => ({
    centerContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    itemContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
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
    const [alert, setAlert] = useState({isOpen: false, message: null, type: 'success'})
    const classes = useStyles()
    const { step, setStep } = useCustomContext()
    const [isStarted, setStarted] = useState(false)
    const [progress, setProgress] = useState('Initializing Process...')
    const [result, setResult] = useState({})

    socket.on('progress_change', currProgress => setProgress(currProgress))
    socket.on('finish_simulation', (data) => {
        const { dataBefore, dataAfter } = data
        console.log('data is, ', data)

        const parsedDataBefore = JSON.parse(dataBefore)
        const parsedDataAfter = JSON.parse(dataAfter)
        setResult({before: parsedDataBefore, after: parsedDataAfter})
        console.log('this is data before', parsedDataBefore)
        console.log('this is data after:', parsedDataAfter)
        setProgress('done')
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

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert({...alert, isOpen: false});
    };

    const handleSave = () => {
        axios
            .get('/download_result')
            .then(res => {
                console.log(res)
                const fileName = res.headers['content-disposition'].split("filename=")[1]
                console.log('file name is ', fileName)
                FileDownload(res.data, fileName)
                setAlert({
                    message: 'Download Success!',
                    type: 'success',
                    isOpen: true
                })
            })
            .catch(err => {
                setAlert({
                    message: JSON.stringify(err),
                    type: 'error',
                    isOpen: true
                })
            })
    }

    return (
        <Paper style={boardStyle}>
            {
                isStarted?
                    <div className={classes.centerContainer}>
                        {progress === 'done'?
                        <div style={{width: '85%'}}>
                            <div className={classes.itemContainer}>
                                <Typography variant='h5' className={classes.title}>
                                    Profile Correction is Done!
                                </Typography>
                            </div>
                            <CompositionViewer 
                                dataBefore={result.before}
                                dataAfter={result.after}/>
                            <div className={classes.itemContainer}>
                                <Button
                                    className={classes.button}
                                    variant='outlined'
                                    color='secondary'
                                    onClick={() => setStep(step - 1) }
                                >
                                    Back
                                </Button>
                                <Button
                                    className={classes.button}
                                    variant='contained'
                                    color='primary'
                                    onClick={handleSave}>
                                    Save
                                </Button>
                            </div>
                            <Snackbar open={alert.isOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                                <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity={alert.type}>
                                    {alert.message}
                                </MuiAlert>
                            </Snackbar>
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
