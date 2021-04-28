import { Container, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TopAppBar from './TopAppBar'
import { Toolbar, Typography } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';


const useStyles = makeStyles({
  root: {
    border: 0,
    opacity: '100%',
    marginBottom: 15,
    width: '90%',
    color: 'black',
    padding: '5px 20px',
    textAlign: 'left'
  },
  button: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    marginBottom: 15,
    marginTop: 50,
    borderRadius: 20,
    color: 'white',
    padding: '5px 30px',
    fontSize: '90%'
  },
  contentWrapper: {
    padding: 20
  },
  title: {
    marginBottom: 50
  },
  listWrapper: {
    paddingLeft: 50,
    paddingRight: 50
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
  }
})

function GuideLine() {
  const classes = useStyles()
  const steps = [
    '1. Determine microscope beam diameter',
    '2. Upload line profile data',
    '3. Input additional settings',
    '4. Simulation'
  ]
  return (
    <div>
      <TopAppBar text='Workflow'/>
      <Toolbar />
      <Container maxWidth='sm'>
        <div className={classes.contentWrapper}>
          <Typography
            variant='h5'
            className={classes.title}
          >
            Step-by-step Guideline
          </Typography>
          <div className={classes.listWrapper}>
            {steps.map((step, id) => (
              <div>
                <Typography>{step}</Typography>
                {id !== steps.length - 1 && <hr style={{opacity: '50%'}}/>}
              </div>
            ))}
          </div>
          <div className={classes.buttonContainer}>
            <Button
                className={classes.button}
                href='/working_board'
              >
                Next
                <ArrowForwardIcon />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default GuideLine;
