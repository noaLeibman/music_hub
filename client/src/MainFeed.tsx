import {ProjectCard, ProjectProps} from './ProjectPreview';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import backImg from './images/feedBack.png';
import { baseUrl } from './App';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const MainFeed: React.FC = () => {
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [isSet, setIsSet] = useState<Boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(true);
  const [successAlertOpen, setSuccessAlertOpen] = useState<boolean>(false);

  const getRecentProjects= () => {
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    axios.get(baseUrl + 'project/recent', options
    ).then(async projectPreviewData => {
      let projectsData: ProjectProps[] = JSON.parse(projectPreviewData.data, 
        (key, value) => {if (key === 'image_url' && typeof value !== 'string') {
          return "";
        } 
        return value;
      });
      console.log(projectsData);
      setAlertOpen(false);
      setSuccessAlertOpen(true);
      setProjects(projectsData);
    }).catch(e => console.log(e));
  }

  useEffect(() => {
    if (!isSet){
      setIsSet(true);
      getRecentProjects()
    }
  }, [isSet, projects]);

  return (
    <div style={{
      backgroundImage: "url(" + backImg + ")",
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      overflow: 'auto',
      }}>
        <Snackbar 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={alertOpen}
          autoHideDuration={6000}
          style={{minWidth: '20%'}}>
          <Alert severity="info">
            Getting recent projects...
          </Alert>
        </Snackbar>
        <Snackbar 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={2000}
          open={successAlertOpen}
          onClose={() => setSuccessAlertOpen(false)}>
          <Alert severity="success">
            Recent projects ready!
          </Alert>
      </Snackbar>
        {projects.map((project, index) => {
          return <div style={{margin: '5%'}} key={index}>
            <ProjectCard {...project} key={index}/>
          </div>
        })}
    </div>
  );
}

export default MainFeed;