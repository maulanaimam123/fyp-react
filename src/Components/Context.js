import React, { useState, useContext } from 'react'

const CustomContext = React.createContext()

export function useCustomContext() {
    return useContext(CustomContext)
}

export default function ContextProvider({children}) {
    const [step, setStep] = useState(0)
    const [profiles, setProfiles] = useState([])
    const values = {
        step, setStep,
        profiles, setProfiles,
    }
    return (
        <CustomContext.Provider value={values}>
            {children}
        </CustomContext.Provider>
    )
}
