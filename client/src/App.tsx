import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import { Box, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Popover, TextField, Collapse, makeStyles, MenuList} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import SearchBar from "material-ui-search-bar";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import DnsIcon from '@material-ui/icons/Dns';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import MainFeed from './MainFeed';
import Editor from './editor/Editor';
import axios from 'axios';
import queryStringify from 'qs-stringify';
import ProfilePage from './ProfilePage';
import { createFalse } from 'typescript';
import { FormatColorReset } from '@material-ui/icons';
const useStyles = makeStyles({
  popover: {
      padding: '35px'
  }
});

enum MenuItems {
  Main = "Main Feed",
  Profile = "My Profile",
  Create = "Create New Project"
}

const App = () => {

  const classes = useStyles();  
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
  const [signupname, setSignupName] = useState<string>("")
  const [projectname, setProjectName] = useState<string>("");
  const [logout, setLogout] = useState<boolean>(true);
  const [projectdescription, setProjectDescription] = useState<string>("");
  const [collapseOpen, setCollapseOpen] = useState<boolean>(false);
  const [currProjectId, setCurrProjectId] = useState<string>("");
  const [isSet, setIsSet] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isSetAfterCookie, setIsSetAfterCookie] = useState<boolean>(false);
  const [newProjectFlag, setNewProjectFlag] = useState<boolean>(true);
  const [projectSaved, setProjectSaved] = useState<boolean>(false);
  const loginRef = useRef(null);
  const signupRef = useRef(null);
  const createRef = useRef(null);
  const searchSite = (text: string) => {};

  useEffect(() => {
    if (!isSet){
      getUserNameFromCookie()
    }
  }, [isSet, userName])

  const getUserNameFromCookie = () =>{
      axios.get('http://127.0.0.1:8000/users/me/', 
      {withCredentials: true}).then(userData=> {          
        if (userData.status === 200){
          console.log(userData);
          setUserName(userData.data.full_name)
          setUserEmail(userData.data.email);
          console.log(userData.data.full_name)
          setIsSetAfterCookie(true)   
        }
      }).catch(e => {
      console.log(e);
      if (e.status === 401){
      document.cookie = "access_token=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=127.0.0.1; path=/;";
      console.log("cookie deleted")
      }
      

      
    });
    setIsSet(true)
  }

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

  const checkLoginLogout = () => {
    if (userName === ""){
      setLoginButton(!loginButton)
    }
    else handleSetLogout(!logout)
  }
  


  const loginPopover = (open: boolean) => (
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


  const signupPopover = (open:boolean) => (
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

  const createPopover = (open:boolean) => (
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
  const handleSetLogout  = (e:any)=>{
    setLogout(false)
    logoutButtonFunction()
  }
  const handleChangeSignupName = (e: any)=>{
    setSignupName(e.target.value)
  }
  
  const handleChangeSignupPassword = (e: any)=>{
    setSignupPassword(e.target.value)
  }

  const handleProjectNameChange = (e: any)=>{
    setProjectName(e.target.value)
  }

  const handleProjectDescriptionChange = (e: any)=>{
    setProjectDescription(e.target.value)
  }

  const changeSelectedPage = (page: MenuItems) => {
    if (selectedPage === Create && !projectSaved) {
      if(window.confirm("Are you sure you want to leave? To save your changes click 'SAVE PROJECT' first")) {
        setSelectedPage(page);
      }
    } else {
      setSelectedPage(page);
    }
  }
  
  const getMenuDrawer = () => {
    return (
      <Drawer anchor='left' open={menuState} ref={createRef} onClose={toggleDrawer(false)}>
        <List>
          <ListItem button key={MenuItems.Main} onClick={() => changeSelectedPage(MenuItems.Main)}>
            <ListItemIcon><DnsIcon/></ListItemIcon>
            <ListItemText primary={MenuItems.Main} />
          </ListItem>
          <ListItem button key={MenuItems.Profile} onClick={() => changeSelectedPage(MenuItems.Profile)}>
            <ListItemIcon><AccountCircleIcon/></ListItemIcon>
            <ListItemText primary={MenuItems.Profile} />
          </ListItem>
          <ListItem button key={MenuItems.Create} onClick={() => {
              setNewProjectFlag(true);
              setSelectedPage(MenuItems.Create);
              setCreateProject(true);
            }}>
            <ListItemIcon><CreateNewFolderIcon/></ListItemIcon>
            <ListItemText primary={MenuItems.Create} />
          </ListItem>
        </List>
      </Drawer>
      
    );
  };

  const loginThenSet = () => {
    setLoginButton(false)
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
        
        
        if (!isSetAfterCookie){
          getUserNameFromCookie()
        }
      }
    }).catch(e => {
      console.log("Login error");
      console.log(e.request);
      
    });
  }

  const logoutButtonFunction = () => {
    document.cookie = "access_token=;  expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=127.0.0.1; path=/;";
    setUserName("")
    setUserEmail("")
    setIsSetAfterCookie(false)
    console.log("plsdeletecookie")
  }
  const signupThenSet = () => {
    const data = {email: signupemail, hashed_password: signuppassword, full_name: signupname};
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

  const createProjectThenSet = async () => {
    setCreateProject(false)
    setMenuState(false);
    setCreateProject(false);
    setSelectedPage(Create);
    const email = await tryMe();
    // console.log(email);
    if (!email) {
      console.log('email undefined in create project');
      return;
    }
    const data = {project_name: projectname, email: email, description: projectdescription}
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

  const tryMe = async () => {
    const res = await axios.get('http://127.0.0.1:8000/users/me/', {withCredentials: true});
    console.log(res);
    return res.data.email;
  }

  const openEditorOnProject = (uuid: string) => {
    setCurrProjectId(uuid);
    setNewProjectFlag(false);
    setSelectedPage(Create);
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
              style={{marginRight: '70px'}}
            />
            <Button color="inherit" style={{marginLeft: '10px'}} ref={signupRef} onClick={()=>setSignupButton(!signupButton)}>Signup</Button>
            <Button color="inherit" style={{marginLeft: '10px'}} ref={loginRef} onClick={()=>checkLoginLogout()}>
              {userName ? "logout" : "login"}
            </Button>
            {/* <Button color="inherit" style={{marginLeft: '10px'}} ref ={signOutRef} onClick={()=>handleSetLogout(!logout)}>Logout</Button> */}
            {/* <Button color="inherit" style={{marginLeft: '10px'}}  onClick={()=>tryMe()}>TRYME</Button> */}
            <Box fontSize={14} style={{marginLeft: '15px'}}>
              {userName ? 'Welcome, ' + userName : undefined}
              </Box>
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
                      <TextField label="Full Name" value={signupname} onChange = {handleChangeSignupName}/>  
                      <TextField label="E-mail" value={signupemail} onChange = {handleChangeSignupEmail}/>
                      <TextField label="Passsword" value={signuppassword} onChange = {handleChangeSignupPassword}/>
                      <Button onClick={signupThenSet}>Create</Button>
                  </Box> 
            </Popover> 
            <Popover
              anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'center',
                  }}
                  classes = {{paper: classes.popover}}
                  anchorEl ={createRef.current}
                  open = {createProject}
                  onClose = {createPopover(false)}>
                    <Box display="flex" flexDirection="column">
                      <TextField label="Project Name:" value={projectname} onChange = {handleProjectNameChange}/>
                      <TextField label="Description:" value={projectdescription} onChange = {handleProjectDescriptionChange}/>
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
            projectId={currProjectId}
            newProject={newProjectFlag}
            projectSaved={projectSaved}
            setProjectSaved={setProjectSaved}
          />  
        }
        { selectedPage === Profile &&
          <ProfilePage
            userName={userName}
            email={userEmail}
            openEditor={openEditorOnProject}
          />
        }
      </Box>
    </div>
  );
}


export default App;

