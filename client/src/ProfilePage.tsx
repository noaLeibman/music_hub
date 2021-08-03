import { Card, CardContent, Grid, List, ListItem, ListItemText, makeStyles, Paper, Typography } from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import axios from "axios";
import React, { useEffect, useState } from "react";
import waveImg from './images/wave.png';

type ProjectDetails = {
  name: string;
  description: string;
  uuid: string;
}

type Props = {
    userName: string;
    email: string;
    openEditor: (uuid: string) => void;
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

const ProfilePage: React.FC<Props> = (props) => {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [alreadyGotProjects, setAlreadyGotProjects] = useState<boolean>(false); 
  const classes = useStyles();

  useEffect(() => {
    if (!alreadyGotProjects && props.email !== "") {
      setAlreadyGotProjects(true);
      const options = {
        withCredentials :true,
        headers: {
        'Access-Control-Allow-Credentials':'true'
        }
      };
      axios.get('http://127.0.0.1:8000/project?mail=' + props.email, options
      ).then(userProjectsData => {
        console.log(userProjectsData.data);
        const projectsList: ProjectDetails[] = JSON.parse(userProjectsData.data).map((project: any) => {
          return {
            name: project.project_name,
            description: project.description,
            uuid: project.project_id,
          }
        });
        setProjects(projectsList);
      }).catch(error => {
        console.log(error);
      });
    }
  }, [projects, alreadyGotProjects, props.email]);
  
  const getProjectListItems = () => {
    return projects.map((project: ProjectDetails) => 
      <ListItem button key={project.uuid} onClick={() => props.openEditor(project.uuid)}>
        <QueueMusicIcon style={{margin: '10px'}}/>
        <ListItemText primary={project.name} secondary={project.description} />
      </ListItem>
    );
  }

  return (
    <div>
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
      : <Paper style={{display: 'flex', justifyContent: 'center', padding: '30px', marginBottom: '30px', marginTop: '30px'}}>
          <Typography className={classes.message} variant="h3" component="h2" align='center'>
            <strong> Please Log In or Sign-Up! </strong>
          </Typography>
        </Paper> }
      <img src={waveImg} alt="" style={{height: "350px", width: '100%'}}></img>
    </div>
  );
}

export default ProfilePage;