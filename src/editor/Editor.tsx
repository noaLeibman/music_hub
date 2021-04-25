import { Button } from '@material-ui/core';
import { useState } from "react";
import {WaveformPlayer, Recorder, UserMedia} from "../ToneComponents";
import RecordedTrack from "./RecordedTrack"

type Props = {
  player: WaveformPlayer | undefined;
  recorder: Recorder | undefined;
  userMic: UserMedia | undefined;
}

const Editor: React.FC<Props> = (props) => {

  const [recordedTracks, setRecordedTracks] =  useState<Element[]>([]);

  const addRecordedTrack = () => {
    const newTrack: any = <RecordedTrack recorder={props.recorder} userMic={props.userMic}/>;
    setRecordedTracks([...recordedTracks, newTrack]);
  }

  return (
    <div>
      <div>
        <Button onClick={addRecordedTrack}>Add track</Button>
      </div>
      <div>
          {recordedTracks}
      </div>
    </div>
  );
}
  
export default Editor;