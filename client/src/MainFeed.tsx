import {ProjectCard, ProjectProps} from './ProjectPreview';
import React, { useEffect, useState } from "react";
import axios from 'axios';
import backImg from './images/feedBack.png';
import { baseUrl } from './App';

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
    axios.get(baseUrl + 'project/recent', options
    ).then(async projectPreviewData => {
      let projectsData: ProjectProps[] = JSON.parse(projectPreviewData.data, 
        (key, value) => {if (key === 'image_url' && typeof value !== 'string') {
          return "";
        } 
        return value;
      });
      console.log(projectsData);
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
        {projects.map((project, index) => {
          return <div style={{margin: '5%'}}>
            <ProjectCard {...project} key={index}/>
          </div>
        })}
    </div>
  );
}

export default MainFeed;