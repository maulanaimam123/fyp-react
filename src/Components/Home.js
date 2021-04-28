import { Button, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        justifyContent:'center',
        width: '100%',
        height: '100vh'
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
    boardStyle: {
        marginTop: '25vh',
        width: 500,
        height: 250,
        background: 'white',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    item: {
        margin: 30
    },
    buttonContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end'
    }
})

function Home() {
    const classes = useStyles()
    return (
    <div className={classes.container}>
        <Paper className={classes.boardStyle} elevation={5}>
            <Typography
                className={classes.item}
                align='center'
                variant='h4'>
                    Numerical Deconvolutor of Analytical Profiles
            </Typography>
            <div className={classes.buttonContainer}>
                <Button
                    className={[classes.button + ' ' + classes.item]}
                    href='/guideline'
                >
                    Start Deconvoluting
                    <ArrowForwardIcon />
                </Button>
            </div>
        </Paper>
    </div>
    );
}

export default Home;