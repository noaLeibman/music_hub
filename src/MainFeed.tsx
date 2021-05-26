import { useState } from 'react';
import {ProjectCard, ProjectProps} from './ProjectPreview';
import { WaveformPlayer } from './ToneComponents';

const url = "https://music-hub-public-164582924dbjh.s3.eu-central-1.amazonaws.com/The+Beatles+-+Penny+Lane.mp3";

type Props = {
  player: WaveformPlayer | undefined;
}

const MainFeed: React.FC<Props> = (props) => {
  const [projects, setProjects] = useState<ProjectProps[]>([]);

  return (
    <div>
        {projects.map((project, index) => {
          return <ProjectCard {...project} key={index}/>
        })}
    </div>
  );
}

export default MainFeed;