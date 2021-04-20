import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, Toolbar, List, ListItem,
         ListItemText, TextField, Button,
         Container, Typography, Box, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { useCustomContext } from './Context'
import axios from 'axios'


export default function SideNavBar({sideBarWidth = 240}) {
    const useStyles = makeStyles((theme) => ({
        drawer: {
            width: sideBarWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: sideBarWidth,
        },
        drawerContainer: {
            overflow: 'auto',
        }
    }));
    const classes = useStyles();
    const { step } = useCustomContext()
    const navigation = [
        'Beam Diameter',
        'Sample Settings',
        'Microscope Settings',
        'Simulation',
    ]
    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
            paper: classes.drawerPaper,
            }}
        >
            <Toolbar />
            <div className={classes.drawerContainer}>
                <List>
                    {navigation.map((text, id) => (
                    <div>
                        <ListItem button key={text} selected={id == step}>
                            <ListItemText primary={text} />
                        </ListItem>
                    </div>
                    ))}
                </List>
            </div>
        </Drawer>
    )
}

export function ProfilesBar({ profilesBarWidth = 320 }) {
    const { isReadable, setReadable } = useCustomContext()
    const useStyles = makeStyles((theme) => ({
        drawer: {
            width: profilesBarWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: profilesBarWidth,
        },
        drawerContainer: {
            overflow: 'auto',
        }
    }));
    const classes = useStyles();
    const { profiles, setProfiles } = useCustomContext()
    const { lines, setLines } = useCustomContext()
    const [ open, setOpen ] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (lines.length < 1) {
            setOpen(true)
            return
        }

        const form = e.target
        const formData = new FormData()
        formData.append('scalebar', form.scalebar.value)
        formData.append('energy', form.energy.value)
        formData.append('lines', JSON.stringify(lines))
        axios
            .post('/manual_input', formData)
            .then(res => {
                setReadable(true)
                setLines([])
                setProfiles([])
                console.log(res)
            })
            .catch(err => console.log(err))
    }

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
    };

    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
            paper: classes.drawerPaper,
            }}
            anchor='right'
        >
            <Toolbar />
            <div className={classes.drawerContainer}>
            {isReadable?
                profiles.map(profile => <p>{JSON.stringify(profile)}</p>)
                    :
                <Container>
                    <Toolbar />
                    <Typography variant='h6'>Drag a line and input scalebar</Typography>
                    <form noValidate onSubmit={handleSubmit} id='form'>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="scalebar"
                            label="Scalebar Reading (nm)"
                            name="scalebar"
                            autoFocus
                            size='small'
                            type='number'
                        />
                        <TextField
                            variant="outlined"
                            margin="dense"
                            required
                            fullWidth
                            id="energy"
                            label="Energy (keV)"
                            name="energy"
                            size='small'
                            type='number'
                        />
                        <Box display='flex' justifyContent='flex-end' mt={1}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Input
                            </Button>
                            <Snackbar open={open} autoHideDuration={6000} onClose={handleAlertClose}>
                                <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity="error">
                                    Drag a <strong>line</strong> or more to create <strong>scalebar</strong>!
                                </MuiAlert>
                            </Snackbar>
                        </Box>
                    </form>
                </Container>
            }
            </div>
        </Drawer>
    )
}