import { Box, Button, ButtonGroup, makeStyles } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import React, { useEffect, useState } from "react";
import * as Tone from 'tone';
import {WaveformPlayer, Recorder, UserMedia, PeaksPlayer} from "../ToneComponents";
import Metronome from './Metronome';
import RecordedTrack from "./RecordedTrack";
import {SynthTrack, chordToNotes} from './SynthTrack';

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
  length: number;
}

type RTData = {
  player: PeaksPlayer;
  url: string | undefined;
}

type SynthData = {
  chords: ChordData[];
  order: number[];
}

type ProjectJson = {
  recordedUrls: string[];
  synthTracks: SynthData[];
  length: number;
}

const testProject: ProjectJson = {
  recordedUrls: ['https://music-hub-public-164582924dbjh.s3.eu-central-1.amazonaws.com/The+Beatles+-+Penny+Lane.mp3'],
  synthTracks: [{
    chords: [
      {
        id: 1,
        name: 'A',
        duration: 1,
        durationStr: '1',
        startTime: 0,
      },
      {
        id: 2,
        name: 'C',
        duration: 1,
        durationStr: '1',
        startTime: 1,
      }
    ],
    order: [1, 2],
  }],
  length: 10,
}

const Editor: React.FC<Props> = (props) => {
  const [recordedTracks, setRecordedTracks] = useState<RTData[]>([]);
  const [synthTracks, setSynthTracks] = useState<STData[]>([]);
  const [longestTrack, setLongestTrack] = useState<number>(0);

  const classes = useStyles();

  useEffect(() => {
    createFromJson(testProject);
  }, []);

  const handleLongestTrack = (value: number) => {
    setLongestTrack(value);
  }

  const addRecordedTrack = () => {
    const track = {
      player: new PeaksPlayer(),
      url: undefined,
    }
    setRecordedTracks([...recordedTracks, track]);
  }

  const addSynthTrack = () => {
    const newTrack: STData = {
      synth: new Tone.PolySynth().toDestination(),
      chordsOrder: [],
      activeChords: new Map(),
      length: 0,
    };
    setSynthTracks([...synthTracks, newTrack]);
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
    const copy = [...synthTracks];
    copy[idx].chordsOrder = newOrder;
    setSynthTracks(copy);
  }

  const setSTActiveChords = (newActiveChords: Map<number,ChordData>, idx: number) => {
    const copy = [...synthTracks];
    copy[idx].activeChords = newActiveChords;
    setSynthTracks(copy);
  }

  const setSTSynth = (newSynth: Tone.PolySynth, idx: number) => {
    const copy = [...synthTracks];
    copy[idx].synth = newSynth;
    setSynthTracks(copy);
  }

  const deleteTrack = (idx : number, type: string) => {
    if (type === 'synth') {
      const copy = [...synthTracks];
      copy.splice(idx, 1);
      setSynthTracks(copy);
    } else {
      const copy = [...recordedTracks];
      copy.splice(idx, 1);
      setRecordedTracks(copy);
    }
  }

  const createFromJson = (json: ProjectJson) => {
    const rTracks: RTData[] = json.recordedUrls.map((url: string, index: number) => {
      return  {
        player: new PeaksPlayer(),
        url: url,
      }
    });
    const sTracks: STData[] = json.synthTracks.map((data: SynthData, index: number) => {
      const newMap = new Map();
      const newSynth = new Tone.PolySynth().toDestination();
      newSynth.sync();
      let length = 0;
      data.chords.forEach((chord: ChordData) => {
        length += chord.duration;
        newMap.set(chord.id, chord);
        const notes = chordToNotes.get(chord.name);
        if (!notes) return;
        newSynth.triggerAttackRelease(notes, chord.durationStr, chord.startTime);
      })
      return {
        activeChords: newMap,
        chordsOrder: data.order,
        synth: newSynth,
        length: length,
        key: index,
      }
    });
    setLongestTrack(json.length);
    setRecordedTracks(rTracks);
    setSynthTracks(sTracks);
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
      {(recordedTracks.length !==0 || synthTracks.length !== 0)  && <Box className={classes.tracksContainer}>
        {recordedTracks.map((data, index) => {
          return <RecordedTrack
            id={index} 
            recorder={props.recorder}
            userMic={props.userMic}
            tracksLength={longestTrack}
            setTracksLength={handleLongestTrack}
            player={data.player}
            url={data.url}
            deleteTrack={deleteTrack}
          />;
        })}
        {synthTracks.map((data, index) => {
          return <SynthTrack
            id={index}
            initialLength={data.length}
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