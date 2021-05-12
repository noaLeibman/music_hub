import { Box, Button, ButtonGroup, makeStyles } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import React, { useEffect, useState } from "react";
import * as Tone from 'tone';
import {WaveformPlayer, Recorder, UserMedia, PeaksPlayer} from "../ToneComponents";
import Metronome from './Metronome';
import RecordedTrack from "./RecordedTrack"
import SynthTrack from './SynthTrack';

const useStyles = makeStyles({
  root: {
    boxShadow: '0 3px 5px 2px #a7abb0',
    padding: '10px',
    border: 1,
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'column',
    width: '120px',
  },
  tracksContainer: {
    boxShadow: '0 3px 5px 2px #a7abb0',
    padding: '10px',
    border: 1,
    marginTop: '10px',
    marginLeft: '165px',
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    margin: '5px'
  },
});

type Props = {
  player: WaveformPlayer | undefined;
  recorder: Recorder | undefined;
  userMic: UserMedia | undefined;
}

export type ChordData = {
  id: number;
  name: string;
  duration: number;
  durationStr: string;
  startTime: number;
}

type STData = {
    synth: Tone.PolySynth;
    activeChords: Map<number,ChordData>;
    chordsOrder: number[];
}

const Editor: React.FC<Props> = (props) => {
  const [RTPlayers, setRTPlayers] = useState<PeaksPlayer[]>([]);
  const [STDataList, setSTDataList] = useState<STData[]>([]);
  const [longestTrack, setLongestTrack] = useState<number>(0);

  const classes = useStyles();

  useEffect(() => {
    console.log('in Editor useEffect: ' + longestTrack);
  }, [longestTrack])

  const handleLongestTrack = (value: number) => {
    setLongestTrack(value);
  }

  const addRecordedTrack = () => {
    setRTPlayers([...RTPlayers, new PeaksPlayer()]);
  }

  const addSynthTrack = () => {
    const newTrack: STData = {
      synth: new Tone.PolySynth().toDestination(),
      chordsOrder: [],
      activeChords: new Map()
    };
    setSTDataList([...STDataList, newTrack]);
  }
  
  const play = () => {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
    }
    Tone.Transport.start();
  }

  const pause = () => {
    Tone.Transport.pause();
  }

  const stop = () => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
  }

  const setSTChordsOrder = (newOrder: number[], idx: number) => {
    const copy = [...STDataList];
    copy[idx].chordsOrder = newOrder;
    setSTDataList(copy);
  }

  const setSTActiveChords = (newActiveChords: Map<number,ChordData>, idx: number) => {
    const copy = [...STDataList];
    copy[idx].activeChords = newActiveChords;
    setSTDataList(copy);
  }

  const setSTSynth = (newSynth: Tone.PolySynth, idx: number) => {
    const copy = [...STDataList];
    copy[idx].synth = newSynth;
    setSTDataList(copy);
  }

  const deleteTrack = (idx : number, type: string) => {
    if (type === 'synth') {
      const copy = [...STDataList];
      copy.splice(idx, 1);
      setSTDataList(copy);
    } else {
      const copy = [...RTPlayers];
      copy.splice(idx, 1);
      setRTPlayers(copy);
    }
  }

  return (
    <Box>
      <div style={{width: '120px', float: 'left'}}>
        <Metronome/>
        <Box className={classes.root}>
          <ButtonGroup size="small" className={classes.button}>
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
          <Button className={classes.button} color='secondary' variant='contained' size='small' onClick={addRecordedTrack}>Add recording track</Button>
          <Button className={classes.button} color='secondary' variant='contained' size='small' onClick={addSynthTrack}>Add synth track</Button>
        </Box>
      </div>
      {(RTPlayers.length !==0 || STDataList.length !== 0)  && <Box className={classes.tracksContainer}>
        {RTPlayers.map((player, index) => {
          return <RecordedTrack
            id={index} 
            recorder={props.recorder}
            userMic={props.userMic}
            tracksLength={longestTrack}
            setTracksLength={handleLongestTrack}
            player={player}
            deleteTrack={deleteTrack}
          />;
        })}
        {STDataList.map((data, index) => {
          return <SynthTrack
            id={index}
            tracksLength={longestTrack}
            setTracksLength={setLongestTrack}
            activeChords={data.activeChords}
            chordsOrder={data.chordsOrder}
            synth={data.synth}
            setActiveChords={setSTActiveChords}
            setChordsOrder={setSTChordsOrder}
            setSynth={setSTSynth}
            deleteTrack={deleteTrack}
          />
        })}
      </Box>}
    </Box>
  );
}
  
export default Editor;