import React, { useState, useEffect, useRef } from 'react'
import { Button, Typography, Paper } from '@material-ui/core';
import { PhotoCamera} from '@material-ui/icons';
import { Delete, Replay, ArrowForward } from '@material-ui/icons';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { useCustomContext } from './Context'
import Spinner from './spinner/Spinner'




export default function DrawingArea() {
    // Define states
    const { imageData, setImageData } = useCustomContext()
    const [file, setFile] = useState(null)
    const [isDrawing, setDrawing ] = useState(false)
    const { lines, setLines } = useCustomContext()
    const { profiles, setProfiles } = useCustomContext()
    const isFirstRun = useRef(true)
    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const { step, setStep } = useCustomContext()
    const { isReadable, setReadable } = useCustomContext()
    const [isLoading, setLoading] = useState(false)

    // Utility for images interactions
    const loadImage = new Promise((resolve, reject) => {
        const canvas = canvasRef.current
        if (!canvas) reject()
        const ctx = canvas.getContext('2d')
        const image = new Image()
        image.src = imageData
        image.onload = function() {
            // Use the intrinsic size of image in CSS pixels for the canvas element
            imageRef.current = this
            canvas.width = this.naturalWidth
            canvas.height = this.naturalHeight
            ctx.drawImage(this, 0, 0)
            resolve()
        }
    })

    const getRelativeCoordinates = (absoluteLineParams) => {
        const { left, top, width, height } = canvasRef.current.getBoundingClientRect()
        const { x1, y1, x2, y2 } = absoluteLineParams
        return {
            x1: (x1 - left) / width,
            y1: (y1 - top) / height,
            x2: (x2 - left) / width,
            y2: (y2 - top) / height
        }
    }

    const getAbsoluteCoordinates = (relativeLineParams) => {
        const { left, top, width, height } = canvasRef.current.getBoundingClientRect()
        const { x1, y1, x2, y2 } = relativeLineParams
        return {
            x1: left + x1 * width,
            y1: top + y1 * height,
            x2: left + x2 * width,
            y2: top + y2 * height
        }
    }

    const getCanvasCoordinates = (relativeLineParams) => {
        const width = imageRef.current.naturalWidth
        const height = imageRef.current.naturalHeight
        const { x1, y1, x2, y2 } = relativeLineParams
        return {
            x1: x1 * width,
            y1: y1 * height,
            x2: x2 * width,
            y2: y2 * height
        }
    }

    const drawLine = (relativeLineParams) => {
        const ctx = canvasRef.current.getContext('2d')
        const {x1, y1, x2, y2} = getCanvasCoordinates(relativeLineParams)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
    }


    // UseEffect
    useEffect(async () => {
        if (!imageData) return
        setLines([])
        setProfiles([])
        await loadImage
    }, [imageData])

    useEffect(async () => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // Clear canvas
        await loadImage

        // Draw lines
        lines.forEach(lineParams => (drawLine(lineParams)))
    })

    // Define Event Handling
    const onMouseDown = (e) => {
        if (e.button) return // not left click
        setDrawing(true)
        lines.forEach(lineParams => (drawLine(lineParams)))
        const { clientX, clientY } = e
        const lineParams = {
            x1: clientX,
            y1: clientY,
            x2: clientX,
            y2: clientY
        }
        setLines([...lines, getRelativeCoordinates(lineParams)])
    }

    const onMouseMove = (e) => {
        if (!isDrawing) return
        const { clientX, clientY } = e
        const {x1, y1} = getAbsoluteCoordinates(lines[lines.length - 1])
        const newLines = [
                            ...lines.slice(0, lines.length - 1),
                            getRelativeCoordinates({x1, y1, x2: clientX, y2: clientY})
                        ]
        setLines(newLines)
    }

    const onMouseUp = (e) => {
        // Only select when left click
        if (e.button == 2) return

        // set isDrawing to false
        setDrawing(false)

        // if last line is very short, remove it
        const getLength = (lineParams) => {
            const {x1, y1, x2, y2} = getCanvasCoordinates(lineParams)
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
        }
        if (getLength(lines[lines.length - 1]) < 10) {
            setLines([...lines.slice(0, lines.length - 1)])
            return
        }

        // Get profile intensity and beam diameter
        const formData = new FormData()
        formData.append('line', JSON.stringify(lines[lines.length - 1]))
        formData.append('file', file)
        axios
            .post('/get_profile', formData)
            .then(res => setProfiles([...profiles, res.data]))
            .catch(err => console.log('Oops, something went wrong', err))
        console.log(profiles)
    }

    const onMouseLeave = () => {
        if (!isDrawing) return
        onMouseUp()
    }

    const onRightClick = (e) => {
        e.preventDefault()
        const getPointToLineDistance = (point, lineParams) => {
            const {pointX, pointY} = point
            const {x1, y1, x2, y2} = lineParams
            // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
            const up = Math.abs((x2-x1)*(y1-pointY) - (x1-pointX)*(y2-y1))
            const bottom = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2))
            const dist = up / bottom
            return dist
        }
        const {clientX, clientY} = e
        const relativeCoordinates = getRelativeCoordinates({x1: clientX, y1: clientY, x2: clientX, y2: clientY})
        const {x1, y1} = getCanvasCoordinates(relativeCoordinates)

        // Update lines and profiles
        const zipLineProfiles = lines.map((el, i) => ([el, profiles[i]]))
        const filteredLineProfiles = zipLineProfiles.filter(el => {
            const distToLine = getPointToLineDistance({pointX: x1, pointY: y1}, getCanvasCoordinates(el[0]))
            return distToLine > 4
        })
        const newLines = filteredLineProfiles.map(el => el[0])
        const newProfiles = filteredLineProfiles.map(el => el[1])
        setLines(newLines)
        setProfiles(newProfiles)
    }

    // Define Function
    const handleDrop = (acceptedFiles) => {
        setLoading(true)
        const imageURL = URL.createObjectURL(acceptedFiles[0])
        setFile(acceptedFiles[0])

        // Make request to get scalebar and energy readings
        const formData = new FormData()
        formData.append('file', acceptedFiles[0])
        axios
            .post('/upload_image', formData)
            .then((data) => {
                console.log(data)
                setLoading(false)
                setImageData(imageURL)
            })
            .catch(err => {
                setLoading(false)
                setImageData(imageURL)
                setReadable(false)
                console.log('Unable to read scalebar in image')
            })
        
    }

    const handleDelete = () => {
        setImageData(false)
        setProfiles([])
        setLines([])
        setReadable(true)
    }

    const handleReset = (e) => {
        setLines(new Array())
        setProfiles(new Array())
    }

    const handleNext = () => {
        // make request to set beam diameters
        const diameters = profiles.map(el => el.diameter)
        const formData = new FormData()
        formData.append('diameters', JSON.stringify(diameters))
        axios
            .post('/set_diameter', formData)
            .then(res => console.log(res))
            .catch(err => console.log(err))
        setStep(step + 1)
    }

    // Define Styling
    const boardStyle = {
        width: imageData? null : 500,
        height: imageData? null: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 15,
        background: 'white',
        borderRadius: 10
    }

    const dropAreaStyle = {
        border: '3px dashed #abc4ff',
        height: 250,
        width: '100%',
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    }

    const centerContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }

    const imageStyle = {
        maxHeight: '70vh',
        height: 'auto',
        borderRadius: 5
    }

    const buttonGroupStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 2
    }

    const buttonStyle = {
        marginLeft: 10,
        marginTop: 5
    }

    const hiddenButtonStyle = {
        display: isReadable? null : 'none'
    }

    const spinnerWrapperStyle = {
        height: 300
    }

    // Component
    return (
        <div>
            <Paper style={boardStyle}>
                {imageData? 
                <div>
                    <Typography
                        variant='h5'
                        style={{'marginBottom': 20}}
                    >
                    {isReadable?
                        'Select Profiles' :
                        'Unable to Read Scalebar, please Input Mannually'}
                    </Typography>
                    <div style={centerContainerStyle}>
                        <canvas
                            id='canvas'
                            style={imageStyle}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseLeave}
                            onContextMenu={onRightClick}
                            ref={canvasRef}
                            />
                    </div>
                    <div style={buttonGroupStyle}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                            style={buttonStyle}
                        > Delete </Button>
                        <Button
                            variant="contained"
                            color="default"
                            startIcon={<Replay />}
                            onClick={handleReset}
                            style={{...buttonStyle, ...hiddenButtonStyle}}
                        > Reset </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowForward />}
                            disabled={profiles.length === 0}
                            onClick={handleNext}
                            style={{...buttonStyle, ...hiddenButtonStyle}}
                        > Next </Button>
                    </div>
                </div>
                :
                isLoading?
                <div style={{...spinnerWrapperStyle, ...centerContainerStyle}}>
                    <Spinner />
                </div>
                :
                <div>
                    <Typography 
                        variant='h5'
                        style={{marginBottom: 20, marginTop: 10}}
                    >
                        Upload your Image
                    </Typography>
                    <Dropzone onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <div style={dropAreaStyle}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                    startIcon={<PhotoCamera />}>
                                    Upload
                                </Button>
                            </div>
                        </div>
                        </section>
                    )}
                    </Dropzone>
                </div>
                }
            </Paper>
        </div>
    )
}
