import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import TopAppBar from './TopAppBar'
import SideNavBar, { ProfilesBar } from './Sidebars'
import DrawingArea from './DrawingArea.js'
import ContextProvider from './Context'
import { CssBaseline, Toolbar, Container } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  }
}));


export default function WorkingBoard() {
  const classes = useStyles();

  return (
    <ContextProvider>
      <div className={classes.root}>
        <CssBaseline />
        <TopAppBar text='Working Board'/>
        <SideNavBar sideBarWidth={240} />
        <main className={classes.content}>
          <Container maxWidth='md' style={{ marginTop: 30 }}>
            <DrawingArea/>
          </Container>
        </main>
        <ProfilesBar />
      </div>
    </ContextProvider>
  );
}
