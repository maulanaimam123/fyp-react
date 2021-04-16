// import React from 'react'
import Container from '@material-ui/core/Container'
import DrawingArea from './DrawingArea.js'
// import { AppBar, Toolbar, Typography, CssBaseline } from '@material-ui/core';
// import { makeStyles, useTheme } from '@material-ui/core/styles';


import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import TopAppBar from './TopAppBar'
import SideNavBar from './Sidebars'
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  }
}));

// To-do:
// 1. useContext for pagination
// 2. Left sidebar for progress
// 3. right sidebar for helper
// 4. useContext for globalised states

export default function WorkingBoard() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopAppBar text='Working Board'/>
      <SideNavBar sideBarWidth={240} />
      <main className={classes.content}>
        <Toolbar />
        <Container maxWidth='md' style={{ marginTop: 30 }}>
          <DrawingArea/>
        </Container>
      </main>
    </div>
  );
}
