import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import TopAppBar from './TopAppBar'
import SideNavBar, { ProfilesBar } from './Sidebars'
import DrawingArea from './DrawingArea.js'
import ProfileUploader from './ProfileUploader'
import AdditionalSetting from './AdditionalSetting'
import Simulation from './Simulation'
import ContextProvider, { useCustomContext } from './Context'
import { CssBaseline, Toolbar, Container } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

function ContentSelector () {
  const { step } = useCustomContext()
  switch (step) {
    case 0: return <DrawingArea />;
    case 1: return <ProfileUploader />;
    case 2: return <AdditionalSetting />;
    case 3: return <Simulation />;
    default: return <div />
  }
}

function RightSideBarSelector() {
  const { step } = useCustomContext()
  switch (step) {
    case 0: return ProfilesBar({ profilesBarWidth: 400 });
    default: return(
      <div>
        <Toolbar />
      </div>
    )
  }
}

export default function WorkingBoard() {
  const classes = useStyles();

  return (
    <ContextProvider>
      <div className={classes.root}>
        <CssBaseline />
        <TopAppBar text='Working Board'/>
        <SideNavBar sideBarWidth={240} />
        <main className={classes.content}>
          <Toolbar />
          <Container maxWidth='md' className={classes.container}>
            <ContentSelector />
          </Container>
        </main>
        <RightSideBarSelector />
      </div>
    </ContextProvider>
  );
}
