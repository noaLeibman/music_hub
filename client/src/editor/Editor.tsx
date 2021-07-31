import { Box, Button, ButtonGroup, makeStyles } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import React, { useEffect, useState } from "react";
import * as Tone from 'tone';
import {Recorder, UserMedia, PeaksPlayer, Effects, startTone} from "../ToneComponents";
import Metronome from './Metronome';
import RecordedTrack from "./RecordedTrack";
import {SynthTrack, chordToNotes} from './SynthTrack';
import UploadedTrack from './UploadedTrack';
import * as utils from 'audio-buffer-utils';
import {ChordData, STData, RTData, UTData, ProjectJson, SynthData} from './Types';
import axios from 'axios';

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
  projectId: string;
}

const Editor: React.FC<Props> = (props) => {
  const [recordedTracks, setRecordedTracks] = useState<RTData[]>([]);
  const [synthTracks, setSynthTracks] = useState<STData[]>([]);
  const [uploadedTracks, setUploadedTracks] = useState<UTData[]>([]);
  const [longestTrack, setLongestTrack] = useState<number>(0);
  const [recorder, setRecorder] = useState<Recorder>();
  const [userMic, setUserMic] = useState<UserMedia>();

  const classes = useStyles();

  const initState = async () => {
    await startTone();
    setRecorder(new Recorder());
    setUserMic(new UserMedia());
  }

  useEffect(() => {
    initState();
  }, [])
  
  const handleLongestTrack = (value: number) => {
    setLongestTrack(value);
  }

  const addRecordedTrack = () => {
    const track: RTData = {
      player: new PeaksPlayer(),
      url: undefined,
      effects: {
        reverb: {
          on: false,
          node: undefined,
        },
        distortion: {
          on: false,
          node: undefined,
        },
        tremolo: {
          on: false,
          node: undefined,
        }
      },
      file: undefined,
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

  const addUploadedTrack = () => {
    setUploadedTracks([...uploadedTracks, {player: new PeaksPlayer(), file: undefined}])
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

  const setUTFile = (file: Blob, idx: number) => {
    const copy = [...uploadedTracks];
    copy[idx].file = file;
    setUploadedTracks(copy);
  }

  const setRTFile = (file: Blob, idx: number) => {
    const copy = [...recordedTracks];
    copy[idx].file = file;
    setRecordedTracks(copy);
  }

  const connectEffect = (effect: Tone.ToneAudioNode, trackType: string, id: number) => {
    let player;
    if (trackType === 'recorded') {
      player = recordedTracks[id].player;
    } else if (trackType === 'uploaded') {
      player = uploadedTracks[id].player;
    }
    if (!player) {
        console.log('player undefined');
        return;
    }
    try {
      player.connect(effect);
    } catch (e) {
      console.log("in connectEffect: " + e);
    }
  }

  const disconnectEffect = (effect: Tone.ToneAudioNode, trackType: string, id: number) => {
    let player;
    if (trackType === 'recorded') {
      player = recordedTracks[id].player;
    } else if (trackType === 'uploaded') {
      player = uploadedTracks[id].player;
    }
    if (!player) {
        console.log('player undefined');
        return;
    }
    try {
      player.disconnect(effect);
    } catch (e) {
      console.log('in disconnectEffect: ' + e);
    }
  }

  const addEffect = (effect: string, value: number, type: string, id: number) => {
    let toConnect, toDisconnect: Tone.ToneAudioNode | undefined;
    let trackData, copy;
    if (type === 'recorded') {
      trackData = recordedTracks[id];
      copy = [...recordedTracks];
    } else if (type === 'uploaded'){
      trackData = uploadedTracks[id];
      copy = [...uploadedTracks];
      return;
    } else {
      console.log('wrong type sent to addEffect');
      return;
    }
    if (effect === 'reverb') {
      if (!trackData.effects.reverb.on) {
        copy[id].effects.reverb.on = true;
      }
      if (value === 0) {
          if (trackData.effects.reverb.node) {
              disconnectEffect(trackData.effects.reverb.node, type, id);
          }
          setRecordedTracks(copy);
          return;
      }
      toConnect = Effects.getReverb(value);
      toDisconnect = trackData.effects.reverb.node;
      copy[id].effects.reverb.node = toConnect;
      console.log(toDisconnect);
    } else if (effect === 'distortion') {
      if (!trackData.effects.distortion.on) {
        copy[id].effects.distortion.on = true;
      }
      if (value === 0) {
          if (trackData.effects.distortion.node) {
              disconnectEffect(trackData.effects.distortion.node, type, id);
          }
          return;
      }
      toConnect = Effects.getDistortion(value);
      toDisconnect = trackData.effects.distortion.node;
      copy[id].effects.distortion.node = toConnect;
    } else if (effect === 'tremolo') {
      if (!trackData.effects.tremolo.on) {
        copy[id].effects.tremolo.on = true;
      }
      if (value === 0) {
          if (trackData.effects.tremolo.node) {
              disconnectEffect(trackData.effects.tremolo.node, type, id);
          }
          return;
      }
      toConnect = Effects.getTremolo(value);
      toDisconnect = trackData.effects.tremolo.node;
      copy[id].effects.tremolo.node = toConnect;
    }
    console.log('disconnecting: ' + toDisconnect + ', connecting: ' + toConnect);
    if (toDisconnect !== undefined) disconnectEffect(toDisconnect, type, id);
    if (toConnect !== undefined) connectEffect(toConnect, type, id);
    if (copy) setRecordedTracks(copy);
}

  const sliceTrack = (sliceFrom: number, sliceTo: number, trackType: string, id: number) => {
    if (sliceFrom === sliceTo) {
      return;
    }
    let player;
    if (trackType === 'recorded') {
      player = recordedTracks[id].player;
    } else if (trackType === 'uploaded') {
      player = uploadedTracks[id].player;
    }
    const buffer1 = player?.player?.getBuffer()?.slice(0, sliceFrom);
    const buffer2 = player?.player?.getBuffer()?.slice(sliceTo);
    if (!(buffer1 && buffer2)) {
        console.log('in sliceTrack: buffers are empty');
        return;
    }
    const newBuffer = utils.concat(buffer1.get(), buffer2.get());
    utils.concat(buffer1.get(), buffer2.get());
    player?.player?.getBuffer().set(newBuffer);
    player?.setPeaksBuffer(newBuffer);
  }

  const deleteTrack = (idx : number, type: string) => {
    if (type === 'synth') {
      const copy = [...synthTracks];
      copy.splice(idx, 1);
      setSynthTracks(copy);
    } else if (type === 'recorded') {
      const copy = [...recordedTracks];
      copy.splice(idx, 1);
      setRecordedTracks(copy);
    } else if (type === 'uploaded') {
      const copy = [...uploadedTracks];
      copy.splice(idx, 1);
      setUploadedTracks(copy);
    }
  }

  const createFromJson = async (projectJson: ProjectJson) => {
    const rTracks: RTData[] = projectJson.recorded.map((url: string, index: number) => {
      return  {
        player: new PeaksPlayer(),
        url: url,
        effects: {
          reverb: {
            on: false,
            node: undefined,
          },
          distortion: {
            on: false,
            node: undefined,
          },
          tremolo: {
            on: false,
            node: undefined,
          }
        },
        file: undefined,
      }
    });
    const uTracks: UTData[] = projectJson.uploaded.map((url: string, index: number) => {
      return {
        player: new PeaksPlayer(),
        url: url,
        file: undefined,
      }
    });
    if (projectJson.json.length) {
      const synthData = await axios.get(projectJson.json[0]);
      console.log(synthData);
      const sTracks: STData[] = synthData.data.map((data: any, index: number) => {
        const newMap = new Map();
        const newSynth = new Tone.PolySynth().toDestination();
        newSynth.sync();
        let length = 0;
        data.activeChords?.forEach((chord: any) => {
          chord = chord[1];
          length += chord.duration;
          newMap.set(chord.id, chord);
          const notes = chordToNotes.get(chord.name);
          if (!notes) return;
          newSynth.triggerAttackRelease(notes, chord.durationStr, chord.startTime);
        })
        return {
          activeChords: newMap,
          chordsOrder: data.chordsOrder,
          synth: newSynth,
          length: length,
          key: index,
        }
      });
      setSynthTracks(sTracks);
    }
    // setLongestTrack(json.length);
    setRecordedTracks(rTracks);
    setUploadedTracks(uTracks);
  }

  const saveProject = async () => {
    sendFilesOf(recordedTracks, 'recorded');
    sendFilesOf(uploadedTracks, 'uploaded');
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    const jsonType = 'application/json';
    const presignedData = await axios.get(
      'http://127.0.0.1:8000/presigned_url/?project_id=' + props.projectId + "&filename=" + 'synth.json' + "&content=" + jsonType,
      options
    );
    console.log(presignedData);
    function replacer(key: any, value: any) {
        if (key === 'synth') return undefined;
        else if (value instanceof Map) {
          return Array.from(value.entries());
        } else return value;
    }
    axios.put(presignedData.data, JSON.stringify(synthTracks, replacer), {headers: {
      'Content-Type': jsonType
    }})
    console.log(JSON.stringify(synthTracks, replacer));
  }

  const sendFilesOf = (tracks: Array<RTData | UTData>, type: string) => {
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    let contentType = type === 'recorded' ? 'audio/webm;codecs=opus' : 'audio/mpeg';
    let postfix = type === 'recorded' ? '.webm' : '.mp3';
    tracks.forEach(async (track, index) => {
      const presignedData = await axios.get(
        'http://127.0.0.1:8000/presigned_url/?project_id=' + props.projectId + "&filename=" + type + "_" + index + postfix + "&content=" + contentType,
        options
      );
      console.log(presignedData);
      let form = new FormData();
      let buffer = track.player.player?.getBuffer().get();
      if (!buffer) {
        console.log('buffer array is' + buffer + 'in saveProject');
        return;
      }
      const type_str = '/' + type + '_';
      let blob = track.file;
      blob && axios.put(presignedData.data, blob, {headers: {
        'Content-Type': blob.type
      }})
      .then(function (response) {
        console.log(response);
      }).catch(function (error) {
        console.log(error);
      });
    })
  }

  const getProject = async () => {
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    const projectData = await axios.get('http://127.0.0.1:8000/presigned_get/?project_id=' + 'c99ae5aa-b6ca-4e28-8967-5d557edb0316', options);
    console.log(projectData);
    createFromJson(JSON.parse(projectData.data));
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
          <Button className={classes.button} color='secondary' variant='contained' size='small' onClick={addUploadedTrack}>Add track for uploading</Button>
          <Button className={classes.button} color='primary' variant='contained' size='small' onClick={saveProject}>Save Project</Button>
          <Button className={classes.button} color='primary' variant='contained' size='small' onClick={getProject}>Get Project</Button>
        </Box>
      </div>
      {(recordedTracks.length !==0 || synthTracks.length !== 0 || uploadedTracks.length !== 0) && 
        <Box className={classes.tracksContainer}>
          {recordedTracks.map((data, index) => {
            return <RecordedTrack
              id={index} 
              recorder={recorder}
              userMic={userMic}
              effects={data.effects}
              tracksLength={longestTrack}
              setTracksLength={handleLongestTrack}
              player={data.player}
              url={data.url}
              deleteTrack={deleteTrack}
              slice={sliceTrack}
              addEffect={addEffect}
              setFile={setRTFile}
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
          {uploadedTracks.map((data, index) => {
            return <UploadedTrack
              player={data.player}
              url={data.url ? data.url : undefined}
              id={index}
              deleteTrack={deleteTrack}
              slice={sliceTrack}
              addEffect={addEffect}
              setFile={setUTFile}
            />
          })}
        </Box>
      }
    </Box>
  );
}
  
export default Editor;
