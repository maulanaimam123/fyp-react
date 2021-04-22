import React from 'react'
import './Spinner.css'

export default function Spinner({ message }) {
    return (
      <div className="loader-container">
        <div className="loader" />
        <span className="loading-text">
            {message ? message : "Loading..."}
        </span>
      </div>
    )
}