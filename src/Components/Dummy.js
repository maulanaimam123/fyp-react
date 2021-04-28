import React, { useState } from 'react'
import { Button, Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import axios from 'axios'
import FileDownload from 'js-file-download'

export default function Dummy() {
    const [alert, setAlert] = useState({isOpen: false, message: null, type: 'success'})
    const [open, setOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('success')

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert({...alert, isOpen: false});
    };
    const handleClick = () => {
        axios
            .get('/download')
            .then(res => {
                console.log(res)
                const fileName = res.headers['content-disposition'].split("filename=")[1]
                FileDownload(res.data, fileName)
                setAlert({
                    message: 'Download Success!',
                    type: 'success',
                    isOpen: true
                })
            })
            .catch(err => {
                setAlert({
                    message: err.response.data,
                    type: 'error',
                    isOpen: true
                })
            })
    }
    return (
        <div style={{border: '1px solid black', background:'white', padding: 15, width: '60%'}}>
            <Button variant='contained' color='primary' onClick={handleClick}>
                Download
            </Button>
            <Snackbar open={alert.isOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity={alert.type}>
                    {alert.message}
                </MuiAlert>
            </Snackbar>
        </div>
    )
}
