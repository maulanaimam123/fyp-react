import React from 'react'
import CompositionViewer from './CompositionViewer'

export default function Dummy() {
    // This is a dummy section to test components while in still development
    const dataBefore = {'Mg': [1,2,3], 'Fe': [3,2,1], 'O': [1,2,3], 'Si':[3,2,1], 'POSITION': [0,1,3]}
    const dataAfter = {'Mg': [3,2,1], 'Fe': [1,2,3], 'O': [3,2,1], 'Si':[1,2,3], 'POSITION': [0,1,3]}
    const data = {'Mg': [3,2,1], 'Fe': [1,2,3], 'O': [3,2,1], 'Si':[1,2,3], 'Na': [4,3,2], 'POSITION': [0,1,3]}
    return (
        <div style={{border: '1px solid black', background:'white', padding: 15, width: '60%'}}>
            <CompositionViewer dataBefore={dataBefore} dataAfter={dataAfter}/>
            <CompositionViewer data={data}/>
        </div>
    )
}
