import {ProjectCard, ProjectProps} from './ProjectPreview';
import React, { useEffect, useState } from "react";
import axios from 'axios';

const url = "https://music-hub-public-164582924dbjh.s3.eu-central-1.amazonaws.com/The+Beatles+-+Penny+Lane.mp3";

type Props = {
  // player: WaveformPlayer | undefined;
}

const MainFeed: React.FC<Props> = (props) => {
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [isSet, setIsSet] = useState<Boolean>(false)



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
  }, [isSet, projects])


  return (
    <div>
        {projects.map((project, index) => {
          return <ProjectCard {...project} key={index}/>
        })}
    </div>
  );
}

export default MainFeed;