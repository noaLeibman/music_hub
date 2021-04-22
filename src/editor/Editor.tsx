import {WaveformPlayer, Recorder, UserMedia} from "../ToneComponents";
import RecordedTrack from "./RecordedTrack"

type Props = {
  player: WaveformPlayer | undefined;
  recorder: Recorder | undefined;
  userMic: UserMedia | undefined;
}

const Editor: React.FC<Props> = (props) => {
    return (
      <div>
          <RecordedTrack
            recorder={props.recorder}
            userMic={props.userMic}
          />
      </div>
    );
  }
  
export default Editor;