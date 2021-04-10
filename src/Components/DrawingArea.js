import React, { useState } from 'react'
import { Button, IconButton } from '@material-ui/core';
import { PhotoCamera} from '@material-ui/icons';
import { Delete, Replay, ArrowForward } from '@material-ui/icons';




export default function DrawingArea() {
    const [data, setData] = useState(false)

    // Define Styling
    const boardStyle = {
        width: data? null : '60%',
        height: data? null: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        border: '1px solid black',
        padding: 15
    }

    const dropAreaStyle = {
        border: '3px dashed #abc4ff',
        height: '100%',
        width: '100%',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
    }

    const imageStyle = {
        width: '100%',
        height: 'auto'
    }

    // Define Function
    const handleUpload = (e) => {
        const imageURL = URL.createObjectURL(e.target.files[0])
        setData(imageURL)
    }

    const handleDelete = () => {
        setData(false)
    }

    const handleReset = () => {
        return null
    }

    const handleNext = () => {
        return null
    }

    // Component
    return (
        <div>
            <div style={boardStyle}>
                {data? 
                <div>
                    <img src={data} style={imageStyle}/>
                    <div>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<Delete />}
                            onClick={ handleDelete }
                        > Delete </Button>
                        <Button
                            variant="contained"
                            color="default"
                            startIcon={<Replay />}
                            onClick={ handleReset }

                        > Reset </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowForward />}
                            onClick={ () => handleNext }

                        > Next </Button>
                    </div>
                </div>
                :
                <div style={dropAreaStyle}>
                    <div style={{marginLeft: '40%'}}>
                        <input
                            type='file'
                            accept='image/*'
                            id='img-choose'
                            onChange={ handleUpload }
                            style={{display: 'None'}}/>
                        <label htmlFor="img-choose">
                            <Button variant="contained" color="primary" component="span">
                                Upload
                            </Button>
                        </label>
                        <label htmlFor='img-choose'>
                            <IconButton color="primary" aria-label="upload picture" component="span">
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}
