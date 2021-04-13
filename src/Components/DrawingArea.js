import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Button, IconButton } from '@material-ui/core';
import { PhotoCamera} from '@material-ui/icons';
import { Delete, Replay, ArrowForward } from '@material-ui/icons';
import Dropzone from 'react-dropzone';




export default function DrawingArea() {
    // Define states
    const [imageData, setImageData] = useState(false)
    const [isDrawing, setDrawing ] = useState(false)
    const [lines, setLines] = useState([])
    const isFirstRun = useRef(true)
    const canvasRef = useRef(null)
    const imageRef = useRef(null)

    // Utility for images interactions
    const loadImage = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const image = new Image()
        image.src = imageData
        image.onload = function() {
            // Use the intrinsic size of image in CSS pixels for the canvas element
            imageRef.current = this
            canvas.width = this.naturalWidth
            canvas.height = this.naturalHeight
            ctx.drawImage(this, 0, 0)
        }
    }

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
    useEffect(() => {
        if (!imageData) return
        setLines([])
        loadImage()
    }, [imageData])

    useLayoutEffect(() => {
        if (isFirstRun.current | lines.length < 1) {
            isFirstRun.current = false;
            return;
        }
        // Clear canvas
        loadImage()

        // Draw lines
        lines.forEach(lineParams => (drawLine(lineParams)))

    }, [lines])

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

    const onMouseUp = () => {
        // set isDrawing to false
        setDrawing(false)
        lines.forEach(lineParams => drawLine(lineParams))
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
        const newLines = lines.filter(lineParams => getPointToLineDistance({pointX: x1, pointY: y1}, getCanvasCoordinates(lineParams)) > 4)
        setLines(newLines)
    }

    // Define Function
    const handleDrop = (acceptedFiles) => {
        const imageURL = URL.createObjectURL(acceptedFiles[0])
        setImageData(imageURL)
    }

    const handleDelete = () => {
        setImageData(false)
    }

    const handleReset = async (e) => {
        setLines(new Array())
        await setTimeout(() => {
            console.log(lines)
        }, 500)
        console.log(lines)
        // loadImage() // force to re-render --> somehow it doesnt work otherwise
    }

    const handleNext = () => {
        console.log('next...')
    }

    // Define Styling
    const boardStyle = {
        width: imageData? null : '60%',
        height: imageData? null: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        border: '1px solid black',
        padding: 15
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

    const imageStyle = {
        width: '100%',
        height: 'auto'
    }

    const buttonGroupStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    }

    const buttonStyle = {
        marginLeft: 10,
        marginTop: 5
    }

    // Component
    return (
        <div>
            <div style={boardStyle}>
                {imageData? 
                <div>
                    <h3>Select your profiles</h3>
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
                    <p style={{display: 'None'}}>
                        (lines.map(line => line.x1))
                    </p>
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
                            style={buttonStyle}
                        > Reset </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowForward />}
                            onClick={handleNext}
                            style={buttonStyle}
                        > Next </Button>
                    </div>
                </div>
                :
                <div>
                    <h3>Upload your image!</h3>
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
            </div>
        </div>
    )
}
