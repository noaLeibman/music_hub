import { Button, ButtonGroup } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import React, { useState } from "react";
import * as Tone from 'tone';
import {WaveformPlayer, Recorder, UserMedia} from "../ToneComponents";
import RecordedTrack from "./RecordedTrack"
import SynthTrack from './SynthTrack';

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
  
  const play = () => {
    if (recordedTracks === []) return;
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
    }
    Tone.Transport.start();
  }

  const pause = () => {
    if (recordedTracks === []) return;
    Tone.Transport.pause();
  }

  const stop = () => {
    if (recordedTracks === []) return;
    Tone.Transport.stop();
  }

  return (
    <div>
      <div>
        <ButtonGroup size="small">
            <Button onClick={play}>
                <PlayArrow/>
            </Button>
            <Button onClick={pause}>
                <PauseIcon/>
            </Button>
            <Button onClick={stop}>
                <StopIcon/>
            </Button> 
        </ButtonGroup>
        <Button onClick={addRecordedTrack}>Add track</Button>
      </div>
      <div>
          <SynthTrack/>
          {recordedTracks}
      </div>
    </div>
  );
}
  
export default Editor;