import {ProjectCard, ProjectProps} from './ProjectPreview';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import backImg from './images/feedBack.png';

const MainFeed: React.FC = () => {
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [isSet, setIsSet] = useState<Boolean>(false);

  const getRecentProjects= () => {
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    const projectPreviewData = axios.get('http://127.0.0.1:8000/projects_recent', options
    ).then(projectPreviewData => {
      console.log(projectPreviewData);
      setProjects(JSON.parse(projectPreviewData.data))
      setIsSet(true)
    });
  }

  useEffect(() => {
    if (!isSet){
      getRecentProjects()
    }
  }, [isSet, projects]);

  return (
    <div style={{backgroundSize: 'contain', backgroundImage: "url(" + backImg + ")"}}>
        {projects.map((project, index) => {
          return <ProjectCard {...project} key={index}/>
        })}
    </div>
  );
}

export default MainFeed;