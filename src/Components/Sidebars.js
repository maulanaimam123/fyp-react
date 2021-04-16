import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Drawer, Toolbar, List, ListItem,
         ListItemText } from '@material-ui/core';



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
                    {navigation.map(text => (
                    <div>
                        <ListItem button key={text}>
                            <ListItemText primary={text} />
                        </ListItem>
                    </div>
                    ))}
                </List>
            </div>
        </Drawer>
    )
}