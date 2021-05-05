import { Button, ButtonGroup } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import React, { useEffect, useState } from "react";
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

  const [recordedTracks, setRecordedTracks] =  useState<React.FC[]>([]);
  const [synthTracks, setSynthTracks] =  useState<Element[]>([]);
  const [longestTrack, setLongestTrack] = useState<number>(0);

  useEffect(() => {
    console.log('in Editor useEffect: ' + longestTrack);
  }, [longestTrack])

  const handleLongestTrack = (value: number) => {
    setLongestTrack(value);
  }

  const addRecordedTrack = () => {
    const newTrack: any = <RecordedTrack
                            key={recordedTracks.length} 
                            recorder={props.recorder}
                            userMic={props.userMic}
                            tracksLength={longestTrack}
                            setTracksLength={handleLongestTrack}
                          />;
    setRecordedTracks([...recordedTracks, newTrack]);
  }

  const addSynthTrack = () => {
    const newTrack: any = <SynthTrack
                            key={recordedTracks.length} 
                            tracksLength={longestTrack}
                            setTracksLength={handleLongestTrack}
                          />;
    setSynthTracks([...synthTracks, newTrack]);
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
    Tone.Transport.seconds = 0;
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
        <Button onClick={addRecordedTrack}>Add recording track</Button>
        <Button onClick={addSynthTrack}>Add synth track</Button>
      </div>
      <div>
          {recordedTracks}
          {synthTracks}
      </div>
    </div>
  );
}
  
export default Editor;