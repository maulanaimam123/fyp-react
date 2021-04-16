import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, Toolbar, List, ListItem,
         ListItemText } from '@material-ui/core';
import { useCustomContext } from './Context'


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
                {profiles.map(profile => <p>{JSON.stringify(profile)}</p>)}
            </div>
        </Drawer>
    )
}