import { Container, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../App.css';

const useStyles = makeStyles({
    root: {
        background: 'linear-gradient(45deg, #FE6B8B, #FF8E53)',
        border: 0,
        marginBottom: 15,
        marginTop: 50,
        borderRadius: 20,
        color: 'white',
        padding: '5px 30px',
        fontSize: '90%'
    }
})

function StyledButton({ text, link='#' }) {
    const classes = useStyles()
    return (
        <Button className={classes.root} href={ link }>
            {`${text}`}
        </Button>
    )
}

function Home() {
    return (
    <Container className="App" maxWidth='sm'>
        <header className="App-header">
            <h2>Numerical Deconvolutor of Analytical Profile</h2>
            <StyledButton text='Start Deconvoluting!' link='/guideline'/>
        </header>
    </Container>
    );
}

export default Home;
export { StyledButton };