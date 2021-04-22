import React, { useState, useContext } from 'react'

const CustomContext = React.createContext()

export function useCustomContext() {
    return useContext(CustomContext)
}

export default function ContextProvider({children}) {
    const [step, setStep] = useState(0)
    const [profiles, setProfiles] = useState([])
    const [isReadable, setReadable] = useState(true)
    const [lines, setLines] = useState([])
    const [imageData, setImageData] = useState(false)

    const values = {
        step, setStep,
        profiles, setProfiles,
        isReadable, setReadable,
        lines, setLines,
        imageData, setImageData,
    }
    return (
        <CustomContext.Provider value={values}>
            {children}
        </CustomContext.Provider>
    )
}
