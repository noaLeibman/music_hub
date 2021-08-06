import { Avatar, Card, CardContent, Grid, IconButton, List, ListItem, ListItemAvatar,
  ListItemSecondaryAction, ListItemText, makeStyles, Paper, Snackbar, Typography } from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from "axios";
import React, { useEffect, useState } from "react";
import waveImg from './images/wave.png';
import {baseUrl} from './App';
import { Alert } from "@material-ui/lab";

type ProjectDetails = {
  name: string;
  description: string;
  uuid: string;
  image: string | undefined;
  imageGetUrl: string | undefined;
}

type Props = {
    userName: string;
    email: string;
    openEditor: (uuid: string, name: string) => void;
}

const useStyles = makeStyles({
  icon: {
      width: '100px',
      height: '100px'
  },
  details: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '30px',
    boxShadow: '0 3px 5px 2px #a7abb0',
    padding: '10px',
    border: 1,
    maxWidth: '700px',
  },
  grid: {
    flexGrow: 1,
  },
  message: {
    margin: '40px',
  }
});

const options = {
  withCredentials: true,
  headers: {
  'Access-Control-Allow-Credentials':'true'
  }
};

const ProfilePage: React.FC<Props> = (props) => {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [alreadyGotProjects, setAlreadyGotProjects] = useState<boolean>(false); 
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState<boolean>(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState<boolean>(false);
  const [deleteSuccessAlertOpen, setDeleteSuccessAlertOpen] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => {
    if (props.userName !== "" && !alreadyGotProjects) setAlertOpen(true);
    if (!alreadyGotProjects && props.email !== "") {
      setAlreadyGotProjects(true);
      axios.get(baseUrl + 'users/project?mail=' + props.email, options
      ).then(async userProjectsData => {
        console.log(userProjectsData.data);
        const projectsList: ProjectDetails[] = JSON.parse(userProjectsData.data).map((project: any) => {
          return {
            name: project.project_name,
            description: project.description,
            uuid: project.project_id,
            image: undefined,
            imageGetUrl: typeof project.image_url === 'object' ? undefined : project.image_url,
          }
        });
        console.log(projectsList);
        setAlertOpen(false);
        setSuccessAlertOpen(true);
        setProjects(projectsList);
      }).catch(error => {
        console.log(error);
      });
    }
  }, [projects, alreadyGotProjects, props.email]);

  const deleteProject = (uuid: string) => {
    if(window.confirm("Are you sure you want to delete this project?")) {
      setDeleteAlertOpen(true);
      axios.post(baseUrl + 'project/delete?project_id=' + uuid, options)
      .then(userProjectsData => {
        // console.log(userProjectsData);
        let projectsList = [...projects];
        const idx = projectsList.findIndex(project => project.uuid === uuid);
        projectsList.splice(idx, 1);
        setDeleteAlertOpen(false);
        setDeleteSuccessAlertOpen(true);
        setProjects(projectsList);
      }).catch(error => {
        console.log(error);
      });
    }
  }
  
  const getProjectListItems = () => {
    return projects.map((project: ProjectDetails) => 
      <ListItem button key={project.uuid} onClick={() => props.openEditor(project.uuid, project.name)}>
        {project.imageGetUrl ?
          <ListItemAvatar>
            <Avatar alt={project.uuid} src={project.imageGetUrl} />
          </ListItemAvatar>
          : <ListItemAvatar>
              <Avatar>
                <QueueMusicIcon style={{margin: '10px'}}/>
              </Avatar>
            </ListItemAvatar>}
        <ListItemText primary={project.name} secondary={project.description} />
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={() => deleteProject(project.uuid)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  const getSnackBars = () => {
    return <div>
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={alertOpen}
        autoHideDuration={6000}
        style={{minWidth: '20%'}}>
        <Alert severity="info">
          Getting your projects...
        </Alert>
      </Snackbar>
      <Snackbar 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={2000}
          open={successAlertOpen}
          onClose={() => setSuccessAlertOpen(false)}>
          <Alert severity="success">
            Projects ready!
          </Alert>
      </Snackbar>
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={deleteAlertOpen}
        autoHideDuration={6000}
        style={{minWidth: '20%'}}>
        <Alert severity="info">
          Deleting project...
        </Alert>
      </Snackbar>
      <Snackbar 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={2000}
          open={deleteSuccessAlertOpen}
          onClose={() => setDeleteSuccessAlertOpen(false)}>
          <Alert severity="success">
            Project deleted
          </Alert>
      </Snackbar>
    </div>
  }

  return (
    <div>
      {getSnackBars()}
      {(props.userName && props.email) ? <Grid container className={classes.grid} spacing={2}>
      <Grid item xs={1}></Grid>
        <Grid item xs={4}>
          <Card className={classes.details}>
            <AccountCircleIcon color='primary' className={classes.icon}/>
            <CardContent>
              <Typography variant="h5" component="h2" align="left">
                <strong> My Details </strong>
              </Typography>
              <Typography variant="body2" component="p" align="left">
                User Name:
              </Typography>
              <Typography variant="body2" component="p" align="left" color="textSecondary">
                &emsp;{props.userName}
              </Typography>
              <Typography variant="body2" component="p" align="left">
                Email:
              </Typography>
              <Typography variant="body2" component="p" align="left" color="textSecondary">
                &emsp;{props.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={7}>
          <Card className={classes.details}>
            <MusicNoteIcon color='primary' className={classes.icon}/>
            <CardContent>
              <Typography variant="h5" component="h2" align="left">
                <strong> My Projects </strong>
              </Typography>
              <List>
                {getProjectListItems()}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      : <Paper variant="outlined" square style={{display: 'flex', justifyContent: 'center', padding: '30px', margin: '30px'}}>
          <Typography className={classes.message} variant="h4" component="h2" align='center'>
            <strong> Please Log In or Sign-Up! </strong>
          </Typography>
        </Paper> }
      <img src={waveImg} alt="" style={{height: "350px", width: '100%'}}></img>
    </div>
  );
}

export default ProfilePage;