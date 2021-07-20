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
  const [uploadedTracks, setUploadedTracks] = useState<UTData[]>([]);
  const [longestTrack, setLongestTrack] = useState<number>(0);
  const [recorder, setRecorder] = useState<Recorder>();
  const [userMic, setUserMic] = useState<UserMedia>();
  // const [webSocket, setWebSocket] = useState<WebSocket>();

  const classes = useStyles();

  // useEffect(() => {
  //   const ws = new WebSocket("ws://127.0.0.1:8000/ws/<project_id>");
  //   ws.onopen = () => {
  //     console.log('web socket open');
  //   }
  //   ws.onmessage = (message: MessageEvent<any>) => {
  //     const json = parseActionJson(message);
  //     if (json !== undefined) {
  //       receiveAction(json);
  //     }
  //     console.log(message)
  //   }
  //   ws.onclose = (e) => {
  //     console.log('web socket closed ' + e.code + e.reason);
  //   }
  //   ws.onerror = (err: Event) => {
  //     console.log(
  //         "Socket encountered error: " +
  //         err +
  //         ", Closing socket"
  //     );
  //     ws.close();
  //   };
  //   setInterval(() => ws.send('this is a message'),5000)
  //   setWebSocket(ws);
  // }, [])

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
      }
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
    setUploadedTracks([...uploadedTracks, {player: new PeaksPlayer()}])
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
    player.connect(effect);
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
    player.disconnect(effect);
  }

//   const addEffect = (effect: string, value: number, trackData: RTData | UTData) => {
//     let toConnect, toDisconnect: Tone.ToneAudioNode | undefined;
//     if (effect === 'reverb') {
//         if (value === 0) {
//             if (data.ffects.reverb) {
//                 props.disconnectEffect(connectedEffects.reverb, 'recorded', props.id);
//             }
//             return;
//         }
//         toConnect = Effects.getReverb(reverbValue);
//         toDisconnect = connectedEffects.reverb;
//         setConnectedEffects({
//             reverb: toConnect,
//             distortion: connectedEffects.distortion,
//             tremolo: connectedEffects.tremolo,
//         });
//     } else if (effect === 'distortion') {
//         if (distortionValue === 0) {
//             if (connectedEffects.distortion) {
//                 props.disconnectEffect(connectedEffects.distortion, 'recorded', props.id);
//             }
//             return;
//         }
//         toConnect = Effects.getDistortion(distortionValue);
//         toDisconnect = connectedEffects.distortion;
//         setConnectedEffects({
//             reverb: connectedEffects.reverb,
//             distortion: toConnect,
//             tremolo: connectedEffects.tremolo,
//         });
//     } else if (effect === 'tremolo') {
//         if (tremoloValue === 0) {
//             if (connectedEffects.tremolo) {
//                 props.disconnectEffect(connectedEffects.tremolo, 'recorded', props.id);
//             }
//             return;
//         }
//         toConnect = Effects.getTremolo(tremoloValue);
//         toDisconnect = connectedEffects.tremolo;
//         setConnectedEffects({
//             reverb: connectedEffects.reverb,
//             distortion: connectedEffects.distortion,
//             tremolo: toConnect,
//         });
//     }
//     if (toDisconnect !== undefined) props.disconnectEffect(toDisconnect, 'recorded', props.id);
//     if (toConnect !== undefined) props.connectEffect(toConnect, 'recorded', props.id);
// }

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

  const createFromJson = (json: ProjectJson) => {
    const rTracks: RTData[] = json.recordedUrls.map((url: string, index: number) => {
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
        }
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

  // const parseActionJson = (json: any) => {
  //   if (!json || !json.trackId || !json.trackType || json.projectId) {
  //     console.log('wrong json was sent from server: ' + json);
  //     return undefined;
  //   }
  //   const chordsMap = new Map<number, ChordData>();
  //   json.chords.forEach((item: any) => {
  //     if (item.id && item.data) {
  //       chordsMap.set(item.id, item.data);
  //     }
  //   })
  //   const actionsJson: ActionsJson = {
  //     projectId: json.projectId,
  //     trackId: json.trackId,
  //     trackType: json.trackType,
  //     effect: json.effect ? json.effect : undefined,
  //     sliceFrom: json.sliceFrom ? json.sliceFrom : undefined,
  //     sliceTo: json.sliceTo ? json.sliceTo : undefined,
  //     chords: json.chords ? json.chords.map((item: any) => {
  //       return {
  //         id: item.id,
  //         data: item.data,
  //       }
  //     }) : undefined,
  //     chordsOrder: json.chordsOrder ? json.chordsOrder : undefined,
  //   }
  // }

  // const sendToServer  = (actionData: ActionsJson) => {
  //   if (!webSocket || webSocket.CLOSED) {
  //     console.log('web socket is undefined or closed');
  //   }
  //   webSocket?.send(JSON.stringify(actionData));
  // }

  // const receiveAction = (changes: ActionsJson) => {
  //   if (!changes || !changes.trackId) {
  //     console.log('no track ID sent from server');
  //     return;
  //   }
  //   let track: RTData | STData | UTData;
  //   if (changes.trackType === 'recorded' || changes.trackType === 'uploaded') {
  //     track = changes.trackType === 'recorded' ? recordedTracks[changes.trackId] : uploadedTracks[changes.trackId];
  //     if (changes.effect) {
  //       addEffect(changes.effect, changes.trackType, changes.trackId);
  //     }
  //     if (changes.sliceFrom && changes.sliceTo) {
  //       if (changes.sliceFrom < changes.sliceTo) {
  //         sliceTrack(changes.sliceFrom, changes.sliceTo, changes.trackType, changes.trackId);
  //       }
  //     }
  //   } else if (changes.trackType === 'synth') {
  //     track = synthTracks[changes.trackId];
  //     if (changes.chords && changes.chordsOrder) {
  //       setSTChordsOrder(changes.chordsOrder, changes.trackId);
  //       const chordsMap = new Map<number, ChordData>();
  //       const synth = new PolySynth();
  //       synth.sync();
  //       let length: number = 0;
  //       changes.chords.forEach((item) => {
  //         chordsMap.set(item.id, item.data);
  //       })
  //       changes.chordsOrder.forEach((chord) => {
  //         let data = chordsMap.get(chord);
  //         if (!data) return;
  //         let notes = chordToNotes.get(data.name);
  //         if (!notes) return;
  //         synth.triggerAttackRelease(notes, data.duration, length);
  //         length += data.duration;
  //       })
  //       setSTActiveChords(chordsMap, changes.trackId);
  //       setSTChordsOrder(changes.chordsOrder, changes.trackId);
  //       setSTSynth(synth, changes.trackId);
  //     }
  //   } else {
  //     console.log('wrong track type was sent from server: ' + changes.trackType);
  //     return;
  //   }
  // }

  const saveProject = async () => {
    const {data: presignedUrlData} = await axios.get(
      'http://127.0.0.1:8000/presigned_url/' + props.projectId,
    );
    sendFilesOf(recordedTracks, presignedUrlData);
    sendFilesOf(uploadedTracks, presignedUrlData);
    let form = new FormData();
    Object.keys(presignedUrlData.fields).forEach(key => {
      form.append(key, presignedUrlData.fields[key]);
    });
    form.append('synthTracks', JSON.stringify(synthTracks));
  }

  const sendFilesOf = (tracks: Array<RTData | UTData>, presignedData: any) => {
    tracks.forEach((track, index) => {
      let form = new FormData();
      Object.keys(presignedData.fields).forEach(key => {
        form.append(key, presignedData.fields[key]);
      });
      let buffer = track.player.player?.getBuffer().toMono().toArray();
      if (!(buffer instanceof Float32Array)) {
        console.log('buffer array is' + buffer + 'in saveProject');
        return;
      }
      form.append('recorded_' + index, new Blob([buffer], { type: 'audio/mp3' }));
      axios.post(presignedData.url, form, {
        headers: {
          'Content-Type': 'multipart/form-data'
         }              
         }).then(function (response) {
           console.log(response);
          })
           .catch(function (error) {
            console.log(error);
         });
    })
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
          <Button className={classes.button} color='primary' variant='contained' size='small'>Save Project</Button>
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
              connectEffect={connectEffect}
              disconnectEffect={disconnectEffect}
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
              id={index}
              deleteTrack={deleteTrack}
              slice={sliceTrack}
              sendEffect={connectEffect}
            />
          })}
        </Box>
      }
    </Box>
  );
}
  
export default Editor;