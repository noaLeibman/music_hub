import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import { Box, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Popover, TextField, Collapse} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import SearchBar from "material-ui-search-bar";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
//import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MainFeed from './MainFeed';
import Editor from './editor/Editor';
import axios from 'axios';
import oauth from 'axios-oauth-client';
import qs from 'qs-stringify';
import { Recorder, startTone, UserMedia } from './ToneComponents';
import { stringify } from 'node:querystring';
import queryStringify from 'qs-stringify';


enum MenuItems {
  Main = "Main Feed",
  Profile = "My Profile",
  Create = "Creat New Project"
}

const App = () => {
  const {Main, Profile, Create} = MenuItems;
  const [selectedPage, setSelectedPage] = useState<string>(Main);
  const [searchText, setSearchText] = useState<string>("");
  const [menuState, setMenuState] = useState<boolean>(false);
  const [loginButton, setLoginButton] = useState<boolean>(false);
  const [signupButton, setSignupButton] = useState<boolean>(false);
  const [createProject, setCreateProject] = useState<boolean>(false)
  const [loginemail, setLoginEmail] = useState<string>("");
  const [loginpassword, setLoginPassword] = useState<string>("");
  const [signupemail, setSignupEmail] = useState<string>("");
  const [signuppassword, setSignupPassword] = useState<string>("");
  const [projectname, setProjectName] = useState<string>("");
  const [collapseOpen, setCollapseOpen] = useState<boolean>(false);
  const [currProjectId, setCurrProjectId] = useState<string>("");
  const loginRef = useRef(null);
  const signupRef = useRef(null);
  const createRef = useRef(null);
  const getMenuList = () => [Main,Profile, Create];
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
  const loginPopover = (open: boolean)=>(
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' && 
      ((event as React.KeyboardEvent).key === 'Tab' || 
      (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setLoginButton(open);
  };
  const signupPopover = (open:boolean)=>(
    event: React.KeyboardEvent | React.MouseEvent,
    ) => {
      if (
        event.type === 'keydown' && 
        ((event as React.KeyboardEvent).key === 'Tab' || 
        (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setSignupButton(open);
    };

  const createPopover = (open:boolean)=>(
    event: React.KeyboardEvent | React.MouseEvent,
    ) => {
      if (
        event.type === 'keydown' && 
        ((event as React.KeyboardEvent).key === 'Tab' || 
        (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setCreateProject(open);
    };

  
  const handleChangeLoginEmail= (e: any)=> {
    setLoginEmail(e.target.value)
  }
  const handleChangeLoginPassword = (e: any) =>{
    setLoginPassword(e.target.value)
  }
  const handleChangeSignupEmail = (e: any)=>{
  
    setSignupEmail(e.target.value)
  }
  const handleChangeSignupPassword = (e: any)=>{
    setSignupPassword(e.target.value)
  }
  const handleProjectNameChange = (e: any)=>{
    setProjectName(e.target.value)
  }
  const checkMenuOption = (text: string) => {
    if (text === Create){
        setCreateProject(true)
    }
    else{
      setSelectedPage(text)
    }
  }
  const getMenuDrawer = () => {
    return (
      <Drawer anchor='left' open={menuState} ref={createRef} onClose={toggleDrawer(false)}>
        <List>
          {getMenuList().map((text, index) => (
            <ListItem button key={text} onClick={()=>checkMenuOption(text)}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
    );
  };
  // const loginThenSet = () => {
    
  //   const data = {username: loginemail, password: loginpassword};
  //   fetch('http://127.0.0.1:8000/token/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(data),
  //   })
  //   .then(response => response.json())
  // .then(data => {
  //   console.log('Success:', data);
  // })
  // .catch((error) => {
  //   console.error('Error:', error);
  // });
  // }
  // const loginThenSet = async() => {
  //   const auth = await getAuthorizationCode();
  //   console.log(auth)

  // }
  // const getAuthorizationCode = oauth.client(axios.create(), {
  //   url: 'http://127.0.0.1:8000/token',
  //   grant_type: 'password',
  //   username: loginemail,
  //   password: loginpassword,
  //   client_id: '',
  //   client_secret: '',
  // });
  const loginThenSet = () => {
    const params = queryStringify({
      'grant_type': 'password',
      'username': loginemail,
      'password': loginpassword,
      'scope': "",
      'client_id': "",
      'client_secret': "",
    });
    console.log(params);
    const options = {
      withCredentials :true,
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Credentials':'true',
      }
    };
    axios.post('http://127.0.0.1:8000/token', params, options
    ).then(result => {
      if (result.status === 200) {
        console.log(result);
      }
    }).catch(e => {
      console.log("Login error");
      console.log(e.request);
      
    });
  }

  
  const signupThenSet = () => {
    const data = {email: signupemail, hashed_password: signuppassword};
    fetch('http://127.0.0.1:8000/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    setCollapseOpen(true);
    setSignupButton(false);
    setSignupPassword("");
    setSignupEmail("");

  })
  .catch((error) => {
    console.error('Error:', error);
  });
  }


  const createProjectThenSet = () => {
    setMenuState(false);
    setCreateProject(false);
    setSelectedPage(Create);
    const data = {project_name: projectname, email: signupemail}
    fetch('http://127.0.0.1:8000/create_project/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      setCurrProjectId(data.uuid);
      setMenuState(false);
      setCreateProject(false);
      setSelectedPage(Create);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  } 
  const tryMe = () => {
    axios.get('http://127.0.0.1:8000/users/me/', {withCredentials: true})
    .then(res => {
      const user = res.data;
      console.log(user)

    })
    
  }
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
              <Button color="inherit" style={{marginLeft: '10px'}} ref={signupRef} onClick={()=>setSignupButton(!signupButton)}>Signup</Button>
              <Button color="inherit" style={{marginLeft: '10px'}} ref={loginRef} onClick={()=>setLoginButton(!loginButton)}>Login</Button>
              <Button color="inherit" style={{marginLeft: '10px'}}  onClick={()=>tryMe()}>TRYME</Button>
              <Popover
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                    }}
                    anchorEl={loginRef.current}
                    open={loginButton}
                    onClose = {loginPopover(false)}>
                    <Box display="flex" flexDirection="column">
                        <TextField label=" e-mail" value={loginemail} onChange = {handleChangeLoginEmail}/>
                        <TextField label=" password" value={loginpassword} onChange = {handleChangeLoginPassword}/>
                        <Button onClick={loginThenSet}>Apply</Button>
                    </Box>  
              </Popover>
              <Popover
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                    }}
                    anchorEl={signupRef.current}
                    open={signupButton}
                    onClose = {signupPopover(false)}
                    >
                        <Box display="flex" flexDirection="column">
                        <TextField label=" e-mail" value={signupemail} onChange = {handleChangeSignupEmail}/>
                        <TextField label=" password" value={signuppassword} onChange = {handleChangeSignupPassword}/>
                        <Button onClick={signupThenSet}>Create</Button>
                    </Box> 
              </Popover> 
              <Popover
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                    }}
                    anchorEl ={createRef.current}
                    open = {createProject}
                    onClose = {createPopover(false)}>
                      <Box display="flex" flexDirection="column">
                        <TextField label=" Project name:" value={projectname} onChange = {handleProjectNameChange}/>
                        <Button onClick={createProjectThenSet}>Apply</Button>
                    </Box>  
              </Popover>
              <Collapse in={collapseOpen}>
                <Alert
                  action={
                  <IconButton
                aria-label="close"
                color="primary"
                size="small"
                onClick={() => {
                setCollapseOpen(false);
              }}>
            </IconButton>}
              >Please log in using your new credentials</Alert>
              </Collapse>
            </Toolbar>
          </AppBar>
          { selectedPage === Main && 
            <MainFeed />   
          }
          { selectedPage === Create && 
            <Editor
              projectId={"1234"}
            />  
          }
        </Box>
      </div>
    );
}


export default App;

