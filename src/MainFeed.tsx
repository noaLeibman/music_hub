import ProjectCard from './ProjectPreview';
import { WaveformPlayer } from './ToneComponents';

const url = "https://music-hub-public-164582924dbjh.s3.eu-central-1.amazonaws.com/The+Beatles+-+Penny+Lane.mp3";

type Props = {
  player: WaveformPlayer | undefined;
}

const MainFeed: React.FC<Props> = (props) => {
  return (
    <div>
        <ProjectCard
          player={props.player}
          url={url}
        />
    </div>
  );
}

export default MainFeed;