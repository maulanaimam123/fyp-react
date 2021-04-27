import React, { useState } from 'react'
import { ButtonGroup, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, Legend,
         CartesianGrid, Tooltip, Label, ResponsiveContainer } from "recharts";


const useStyles = makeStyles((theme) => ({
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 20
    }
}))

export default function CompositionViewer({ data, dataBefore, dataAfter }) {
    const classes = useStyles()

    // data are instance of array [{POSITION, Mg, Al, O, ...}, {POSITION, Mg, Al, O, ...}, {POSITION, Mg, Al, O, ...}]
    // the keys between objects are the same
    const getRechartsData = () => {
        const getValue = (arr, idx, suffix) => {
            if (!arr) return {}
            if (!arr[idx]) return {}

            const data = arr[idx]
            const dataKeys = Object.keys(data)

            return dataKeys.reduce((acc, key) => {
                if (key === 'POSITION') {
                    acc[key] = data[key]
                } else {
                    acc[[key + suffix]] = data[key]
                }
                return acc
            }, {})
        }
        const selectedData = data || dataBefore
        return selectedData.map((entry, id) => (
            {
                ...getValue(data, id, ''),
                ...getValue(dataBefore, id, '_before'),
                ...getValue(dataAfter, id, '_after')
            }
        ))
    }
    const rechartsData = getRechartsData()
    const selectedData = data || dataBefore
    const buttonList = Object.keys(selectedData[0]).filter(key => (key !== 'POSITION'))
    const [plot, setPlot] = useState(buttonList[0])

    return (
        <div>
            <div className={classes.buttonContainer}>
                <ButtonGroup color="primary" aria-label="primary button group">
                    {buttonList.map(button => (
                        <Button
                            variant={plot === button ? 'contained' : 'outlined'}
                            style={{textTransform: 'none'}}
                            onClick={() => setPlot(button)}
                            >{button}</Button>))}
                </ButtonGroup>
            </div>
            <div>
                <ResponsiveContainer width='95%' height={250}>
                    <LineChart
                        data={rechartsData}
                        margin={{
                            top: 5,
                            right: 0,
                            left: 0,
                            bottom: 30
                        }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="POSITION" type='number'>
                            <Label
                                value={'POSITION (um)'}
                                position="bottom"
                                style={{ textAnchor: "middle" }}/>
                        </XAxis>
                        <YAxis
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={value => parseFloat(value).toFixed(2)}
                            />
                        {data && <Line
                            type="monotone"
                            name='Before'
                            dataKey={`${plot}`}
                            stroke="#e8a738"
                            strokeWidth={2}
                            dot={false}
                        />}
                        {dataBefore && <Line
                            type="monotone"
                            name='Before'
                            dataKey={`${plot}_before`}
                            stroke="#e8a738"
                            strokeWidth={2}
                            dot={false}
                        />}
                        {dataAfter && <Line
                            type="monotone"
                            name='After'
                            dataKey={`${plot}_after`}
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={false}
                        />}
                        {!data && <Legend verticalAlign="top" height={30} />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
