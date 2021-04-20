import React from 'react'
import { LineChart, Line, XAxis, YAxis,
         CartesianGrid, Tooltip, Label } from "recharts";
import { useCustomContext } from './Context'
import { Container, Typography, Box } from '@material-ui/core'

export default function LineProfileViewer() {
    const { profiles, imageData } = useCustomContext()
    const toRechartsFormat = (profileData) => {
        // convert profileData = {diameter: float, intensities: int[]}
        // to Recharts acceptable format: data [] where data: {dist: int, intensity: int}
        return profileData.intensities.map((el, id) => (
            {dist: id, intensity: el}
        ))
    }
    let allData
    try {
        allData = profiles.map(profile => toRechartsFormat(profile))
    } catch {
        allData = []
    }

    return (
        <Container>
            {profiles.length > 0? 
            <div>
                <Typography variant='h5' style={{marginTop: 20, marginBottom: 20}}>Profiles Intensity</Typography>
                {allData.map((data, id) => (
                    <LineChart
                        width={350}
                        height={150}
                        data={data}
                        margin={{
                            top: 5,
                            right: 0,
                            left: -20,
                            bottom: 30
                        }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dist" type='number'>
                            <Label
                                value={`Beam Diameter: ${profiles[id].diameter.toFixed(1)} nm`}
                                position="bottom"
                                style={{ textAnchor: "middle" }}
                            />
                        </XAxis>
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="intensity"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                ))}
            </div> :
            imageData?
                <Typography component='div' align='center' style={{marginTop: 40}}>
                    <Box fontStyle='italic' m={1}>
                        Drag a line and see its intensity here!
                    </Box>
                </Typography> :
                <div />
            }
        </Container>
    )
}
