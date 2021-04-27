import { Button, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    button: {
        background: 'linear-gradient(45deg, #FE6B8B, #f2d58f)',
        border: 0,
        marginBottom: 15,
        marginTop: 50,
        borderRadius: 20,
        color: 'white',
        padding: '5px 30px',
        fontSize: '90%'
    },
    boardStyle: {
        width: 500,
        height: 200,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 15,
        background: 'white',
        borderRadius: 10
    }
})

function StyledButton({ text, link='#' }) {
    const classes = useStyles()
    return (
        <Button className={classes.button} href={ link }>
            {`${text}`}
        </Button>
    )
}

function Home() {
    const classes = useStyles()
    return (
    <div className={classes.container}>
        <Paper className={classes.boardStyle} elevation={3}>
            <Typography variant='h4'>Numerical Deconvolutor of Analytical Profile</Typography>
            <StyledButton text='Start Deconvoluting!' link='/guideline'/>
        </Paper>
    </div>
    );
}

export default Home;
export { StyledButton };