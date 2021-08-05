import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import { Box, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Popover, TextField, Collapse, makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import DnsIcon from '@material-ui/icons/Dns';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import MainFeed from './MainFeed';
import Editor from './editor/Editor';
import axios from 'axios';
import {useDropzone} from 'react-dropzone';
import queryStringify from 'qs-stringify';
import ProfilePage from './ProfilePage';
import CloseIcon from '@material-ui/icons/Close';

export const baseUrl = 'http://127.0.0.1:8000/';

const dropzoneStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  margin: '10px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const useStyles = makeStyles({
  popover: {
      padding: '20px'
  },
  toolBar: {
    display: 'flex',
    justifyContent: 'space-between',
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
  const [viewOnlyMode, setViewOnlyMode] = useState<boolean>(false);
  const [projectSaved, setProjectSaved] = useState<boolean>(false);
  const [createProjectImage, setCreateProjectImage] = useState<string>("")
  const [createProjectImageFile, setCreateProjectImageFile] = useState<Blob>()
  const loginRef = useRef(null);
  const signupRef = useRef(null);
  const createRef = useRef(null);

  useEffect(() => {
    if (!isSet){
      getUserNameFromCookie()
    }
  }, [isSet, userName])

  const getUserNameFromCookie = () =>{
      axios.get(baseUrl + 'users/me/', 
      {withCredentials: true}).then(userData=> {          
        if (userData.status === 200){
          console.log(userData);
          setUserName(userData.data.full_name)
          setUserEmail(userData.data.email);
          console.log(userData.data.full_name)
          setIsSetAfterCookie(true)   
        }
      }).catch(e => {
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
  const acceptFile = (files: any, e:any) =>{
    console.log(files[0]);
    const image_url_upload = URL.createObjectURL(files[0]);
    setCreateProjectImageFile(files[0]);
    setCreateProjectImage(image_url_upload);
    

  }
  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: acceptFile,
    maxFiles: 1,
  });

  

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
    setSelectedPage(page);
  }
  
  const getMenuDrawer = () => {
    return (
      <Drawer anchor='left' open={menuState} onClose={toggleDrawer(false)}>
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
              setViewOnlyMode(false);
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
    axios.post(baseUrl + 'token', params, options
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
    fetch(baseUrl + 'users/', {
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
    fetch(baseUrl + 'project/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(async data => {
      console.log('Success:', data);
      setCurrProjectId(data.uuid);
      setMenuState(false);
      setCreateProject(false);
      setSelectedPage(Create);

      const project_id = data.uuid
      if(createProjectImageFile){
        console.log(createProjectImageFile);
        const puturl = await axios.get(baseUrl + 'project/presigned_put_url?project_id='+project_id+'&filename=project_preview.jpeg&content='+createProjectImageFile.type,
        {withCredentials: true})        
      
        axios.put(puturl.data, createProjectImageFile, {headers: {'Content-Type': createProjectImageFile.type}})
        .then (response => {
          console.log(response)
        })
      }
    })
  }

  const tryMe = async () => {
    const res = await axios.get(baseUrl + 'users/me/', {withCredentials: true});
    console.log(res);
    return res.data.email;
  }

  const openEditorOnProject = (uuid: string, name: string) => {
    setViewOnlyMode(false);
    setCurrProjectId(uuid);
    setProjectName(name);
    setNewProjectFlag(false);
    setSelectedPage(Create);
  }

  const openProjectViewOnly = (uuid: string, name: string) => {
    setViewOnlyMode(true);
    setCurrProjectId(uuid);
    setProjectName(name);
    setNewProjectFlag(false);
    setSelectedPage(Create);
  }

  return (
    <div className="App" ref={createRef} >
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
            {userName === "" && 
              <Button color="inherit" ref={signupRef} onClick={()=>setSignupButton(!signupButton)}>Signup</Button>
            }
            {userName && <Box fontSize={16} style={{ marginBottom: '5px', flexGrow: 1}}>
              {'Welcome, ' + userName}
            </Box>}
            <Button color="inherit" ref={loginRef} onClick={()=>checkLoginLogout()}>
              {userName ? "logout" : "login"}
            </Button>
            <Popover
                  anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                  }}
                  anchorEl={loginRef.current} 
                  open={loginButton}
                  onClose={loginPopover(false)}
                  classes={{paper: classes.popover}}>
                  <Box display="flex" flexDirection="column">
                      <TextField label=" e-mail" value={loginemail} onChange={handleChangeLoginEmail}/>
                      <TextField label=" password" type="password" value={loginpassword} onChange={handleChangeLoginPassword}/>
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
                  onClose={signupPopover(false)}
                  classes={{paper: classes.popover}}
                  >
                      <Box display="flex" flexDirection="column">
                      <TextField label="Full Name" value={signupname} onChange = {handleChangeSignupName}/>  
                      <TextField label="E-mail" value={signupemail} onChange = {handleChangeSignupEmail}/>
                      <TextField label="Passsword" value={signuppassword} type="password" onChange = {handleChangeSignupPassword}/>
                      <Button onClick={signupThenSet}>Create</Button>
                  </Box> 
            </Popover> 
            <Popover
              anchorOrigin={{
                  vertical: 200,
                  horizontal: 500,
                  }}
                  classes = {{paper: classes.popover}}
                  anchorEl ={createRef.current}
                  open = {createProject}
                  onClose = {createPopover(false)}>
                    <Box display="flex" flexDirection="column">
                      <TextField label="Project Name:" value={projectname} onChange = {handleProjectNameChange}/>
                      <TextField label="Description:" value={projectdescription} onChange = {handleProjectDescriptionChange}/>
                      {createProjectImage === "" ? 
                      <Box>
                        <Typography variant="body1" component="p" align="left" color="textSecondary" style={{marginTop: '20px'}}>
                          Project Image (optional):
                        </Typography>
                        <div {...getRootProps({className: 'dropzone', style: dropzoneStyle})}>
                          <input {...getInputProps()} />
                          <p>Drag and drop a file here, or click to select file</p>
                        </div> 
                      </Box>
                      : <img src={createProjectImage} alt="" style={{maxWidth: '300px'}}/>
                      }
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
                    <CloseIcon/>
                </IconButton>}
              >Please log in using your new credentials</Alert>
            </Collapse>
          </Toolbar>
        </AppBar>
        { selectedPage === Main && 
          <MainFeed 
            openProjectInEditor={openProjectViewOnly}
          /> 
        }
        { selectedPage === Create && 
          <Editor
            projectId={currProjectId}
            projectName={projectname}
            newProject={newProjectFlag}
            projectSaved={projectSaved}
            viewOnly={viewOnlyMode}
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
    </div>
  );
}


export default App;

