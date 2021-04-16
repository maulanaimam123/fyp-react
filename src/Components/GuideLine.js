import { Container, Button, ButtonGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StyledButton } from './Home.js'
import TopAppBar from './TopAppBar'
import { Toolbar, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    border: 0,
    opacity: '100%',
    marginBottom: 15,
    width: '90%',
    color: 'white',
    padding: '5px 20px',
    textAlign: 'left'
  },
  listButton: {
    paddingTop: 15,
    paddingBottom: 15
  }
})

function GuideLine() {
  const classes = useStyles()
  const steps = [
    '1. Determine Beam Diameter',
    '2. Upload Line Profile Data',
    '3. Determine Microscope Setup',
    '4. Simulation'
  ]
  return (
    <div>
      <TopAppBar text='Workflow'/>
      <Toolbar />
      <Container className="App" maxWidth='sm'>
        <header className="App-header">
          <h2>Steps:</h2>
          <ButtonGroup
            orientation="vertical"
            className={classes.root}
            color='inherit'
            aria-label="vertical contained primary button group"
            variant="text"
          >
            {steps.map(s => (<Button className={classes.listButton}>{`${s}`}</Button>))}
          </ButtonGroup>
          <StyledButton text='Next' link='/working_board' />
        </header>
      </Container>
    </div>
  );
}

export default GuideLine;
