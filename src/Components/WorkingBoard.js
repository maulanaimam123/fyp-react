import React from 'react'
import Container from '@material-ui/core/Container'
import DrawingArea from './DrawingArea.js'

export default function WorkingBoard() {
  return (
    <Container maxWidth='md' style={{ marginTop: 30 }}>
      <DrawingArea/>
    </Container>
  )
}
