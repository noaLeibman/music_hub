import React, { useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import { Box, Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import SearchBar from "material-ui-search-bar";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import ProjectCard from './ProjectPreview';


const App = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [menuState, setMenuState] = useState<boolean>(false);

  const getMenuList = () => ['My Profile', 'Discover', 'Creat New Project'];
  const searchSite = (text: string) => {};

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setMenuState(open);
  };

  const getMenuDrawer = () => {
    return (
      <Drawer anchor='left' open={menuState} onClose={toggleDrawer(false)}>
        <List>
          {getMenuList().map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  };

  return (
    <div className="App">
      <Box style={{height: '100%'}}>
        {getMenuDrawer()}
        <AppBar position="static" color='primary'>
          <Toolbar>
          <IconButton
            edge="start" 
            className="menu-button" 
            color="inherit" 
            aria-label="menu" 
            onClick={toggleDrawer(true)}
            >
            <MenuIcon />
          </IconButton>
            <Typography variant="h4" className="title" align='left' style={{flexGrow: 1}}>
              The Music Hub
            </Typography>
            <SearchBar
              value={searchText}
              onChange={(newValue) => setSearchText(newValue)}
              onRequestSearch={() => searchSite(searchText)}
            />
            <Button color="inherit" style={{marginLeft: '10px'}}>Login</Button>
          </Toolbar>
        </AppBar>
        <ProjectCard/>
        <ProjectCard/>
        <ProjectCard/>
      </Box>
    </div>
  );
}

export default App;
