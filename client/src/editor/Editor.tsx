import { Box, Button, ButtonGroup, makeStyles, Snackbar } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import React, { useCallback, useEffect, useState } from "react";
import * as Tone from 'tone';
import {Recorder, UserMedia, PeaksPlayer, Effects, startTone} from "../ToneComponents";
import Metronome from './Metronome';
import RecordedTrack from "./RecordedTrack";
import {SynthTrack, chordToNotes} from './SynthTrack';
import UploadedTrack from './UploadedTrack';
import * as utils from 'audio-buffer-utils';
import {ChordData, STData, AudioTrackData, ProjectUrls, TrackInfo} from './Types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {baseUrl} from '../App';
import { Alert } from "@material-ui/lab";
import backImg from '../images/feedBack.png';

const useStyles = makeStyles({
  box: {
    minHeight: '700px',
    backgroundImage: "url(" + backImg + ")",
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    overflow: 'auto',
  },
  root: {
    boxShadow: '0 3px 5px 2px #a7abb0',
    padding: '10px',
    border: 1,
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'column',
    width: '120px',
    backgroundColor: 'white',
  },
  tracksContainer: {
    boxShadow: '0 3px 5px 2px #a7abb0',
    padding: '10px',
    border: 1,
    marginTop: '10px',
    marginLeft: '165px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  button: {
    margin: '5px'
  },
});

type Props = {
  projectId: string;
  projectName: string;
  newProject: boolean;
  projectSaved: boolean;
  viewOnly: boolean;
  setProjectSaved: React.Dispatch<React.SetStateAction<boolean>>;
}

const Editor: React.FC<Props> = (props) => {
  const [audioTracks, setAudioTracks] = useState<Map<string, AudioTrackData>>(new Map());
  const [synthTracks, setSynthTracks] = useState<Map<string, STData>>(new Map());
  const [longestTrack, setLongestTrack] = useState<number>(0);
  const [recorder, setRecorder] = useState<Recorder>();
  const [userMic, setUserMic] = useState<UserMedia>();
  const [projectRetrieved, setProjectRetrieved] = useState<boolean>(false);
  const [deletedTracks, setDeletedTracks] = useState<{id: string, type: string}[]>([]);
  const [saveAlertOpen, setSaveAlertOpen] = useState<boolean>(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState<boolean>(false);
  const [getAlertOpen, setGetAlertOpen] = useState<boolean>(false);
  const [getSuccessOpen, setGetSuccessOpen] = useState<boolean>(false);

  const classes = useStyles();

  const initState = async () => {
    await startTone();
    setRecorder(new Recorder());
    setUserMic(new UserMedia());
  }

  useEffect(() => {
    initState();
  }, []);

  useEffect(() => {
    if (props.newProject && !projectRetrieved) {
      setProjectRetrieved(true);
    }
  }, [props, projectRetrieved]);

  useEffect(() => {
      return function cleanSynths() {
        // console.log('cleaning up synths');
        Tone.Transport.cancel();
        Array.from(synthTracks.values()).forEach((track: STData) => {
          // console.log('clean');
          track.synth.disconnect(Tone.getDestination());
          track.synth.unsync();
          track.synth.dispose();
        });
      }
  }, []);
  
  const {newProject, setProjectSaved, projectSaved} = props;

  const getProject = useCallback(() => {
    setGetAlertOpen(true);
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    axios.get(baseUrl + 'project/presigned_get_url?project_id=' + props.projectId, options)
    .then(projectData => {
      // console.log(projectData);
      setProjectSaved(true);
      createFromJson(JSON.parse(projectData.data));
    }).catch(error => {
      console.log(error);
    });
  }, [props.projectId, setProjectSaved]);

  useEffect(() => {
    if (!newProject && !projectRetrieved) {
      // console.log('getting project');
      setProjectRetrieved(true);
      getProject();
    }
  }, [newProject, projectRetrieved, getProject, setProjectSaved]);

  useEffect(() => {
    if (projectSaved && projectRetrieved) {
      setProjectSaved(false);
    }
  }, [audioTracks, synthTracks, projectSaved, setProjectSaved, projectRetrieved]);
  
  const handleLongestTrack = (value: number) => {
    setLongestTrack(value);
  }

  const addAudioTrack = (type: string) => {
    const track: AudioTrackData = {
      type: type,
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
      trackInfo: undefined,
      slices: [],
    }
    setAudioTracks((new Map(audioTracks)).set(uuidv4(), track));
  }

  const addSynthTrack = () => {
    const newTrack: STData = {
      synth: new Tone.PolySynth().toDestination(),
      chordsOrder: [],
      activeChords: new Map(),
      length: 0,
    };
    setSynthTracks((new Map(synthTracks)).set(uuidv4(), newTrack));
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

  const setSTLength = (length: number, id: string) => {
    let track = synthTracks.get(id);
    if (!track) {
      console.log('setSTLength: track id not found');
      return;
    }
    track.length = length
    if (length > longestTrack) {
      setLongestTrack(length);
    }
    setSynthTracks((new Map(synthTracks)).set(id, track));
  }

  const setSTChordsOrder = (newOrder: string[], id: string) => {
    let track = synthTracks.get(id);
    if (!track) {
      console.log('setSTChordsOrder: track id not found');
      return;
    }
    track.chordsOrder = newOrder;
    setSynthTracks((new Map(synthTracks)).set(id, track));
  }

  const setSTActiveChords = (newActiveChords: Map<string, ChordData>, id: string) => {
    let track = synthTracks.get(id);
    if (!track) {
      console.log('setSTChordsOrder: track id not found');
      return;
    }
    track.activeChords = newActiveChords;
    setSynthTracks((new Map(synthTracks)).set(id, track));
  }

  const setSTSynth = (newSynth: Tone.PolySynth, id: string) => {
    let track = synthTracks.get(id);
    if (!track) {
      console.log('setSTChordsOrder: track id not found');
      return;
    }
    track.synth = newSynth;
    setSynthTracks((new Map(synthTracks)).set(id, track));
  }

  const setAudioTrackFile = (file: Blob, id: string) => {
    let track = audioTracks.get(id);
    if (!track) {
      console.log('setAudioTrackFile: track id not found');
      return;
    }
    track.file = file;
    setAudioTracks((new Map(audioTracks)).set(id, track));
  }

  const connectEffect = (effect: Tone.ToneAudioNode, id: string) => {
    let track = audioTracks.get(id);
    if (!track) {
        console.log('connectEffect: track id not found');
        return;
    }
    try {
      track.player.connect(effect);
    } catch (e) {
      console.log("in connectEffect: " + e);
    }
  }

  const disconnectEffect = (effect: Tone.ToneAudioNode, id: string) => {
    let track = audioTracks.get(id);
    if (!track) {
        console.log('disconnectEffect: track id not found');
        return;
    }
    try {
      track.player.disconnect(effect);
    } catch (e) {
      console.log('in disconnectEffect: ' + e);
    }
  }

  const addEffect = (effect: string, value: number, id: string) => {
    let toConnect, toDisconnect: Tone.ToneAudioNode | undefined;
    let trackData = audioTracks.get(id);
    if (!trackData) {
      console.log('addEffect: track id not found');
      return;
    }
    if (effect === 'reverb') {
      if (!trackData.effects.reverb.on) {
        trackData.effects.reverb.on = true;
      }
      if (value === 0) {
          if (trackData.effects.reverb.node) {
              disconnectEffect(trackData.effects.reverb.node, id);
          }
          setAudioTracks((new Map(audioTracks)).set(id, trackData));
          return;
      }
      trackData.effects.reverb.level = value;
      toConnect = Effects.getReverb(value);
      toDisconnect = trackData.effects.reverb.node;
      trackData.effects.reverb.node = toConnect;
      // console.log(toDisconnect);
    } else if (effect === 'distortion') {
      if (!trackData.effects.distortion.on) {
        trackData.effects.distortion.on = true;
      }
      if (value === 0) {
          if (trackData.effects.distortion.node) {
              disconnectEffect(trackData.effects.distortion.node, id);
          }
          setAudioTracks((new Map(audioTracks)).set(id, trackData));
          return;
      }
      trackData.effects.distortion.level = value;
      toConnect = Effects.getDistortion(value);
      toDisconnect = trackData.effects.distortion.node;
      trackData.effects.distortion.node = toConnect;
    } else if (effect === 'tremolo') {
      if (!trackData.effects.tremolo.on) {
        trackData.effects.tremolo.on = true;
      }
      if (value === 0) {
          if (trackData.effects.tremolo.node) {
              disconnectEffect(trackData.effects.tremolo.node, id);
          }
          setAudioTracks((new Map(audioTracks)).set(id, trackData));
          return;
      }
      trackData.effects.tremolo.level = value;
      toConnect = Effects.getTremolo(value);
      toDisconnect = trackData.effects.tremolo.node;
      trackData.effects.tremolo.node = toConnect;
    }
    // console.log('disconnecting: ' + toDisconnect + ', connecting: ' + toConnect);
    if (toDisconnect !== undefined) disconnectEffect(toDisconnect, id);
    if (toConnect !== undefined) connectEffect(toConnect, id);
    setAudioTracks((new Map(audioTracks)).set(id, trackData));
}

  const sliceTrack = (sliceFrom: number, sliceTo: number, id: string) => {
    // console.log("slicing: " + sliceFrom + ", " + sliceTo);
    if (sliceFrom >= sliceTo && sliceTo !== 0) {
      return;
    }
    let track = audioTracks.get(id);
    if (!track) {
      console.log('sliceTrack: id not found');
      return;
    }
    const {player, slices} = track;
    let buffer1, buffer2, newBuffer;
    if (sliceFrom > 0) {
      buffer1 = player?.player?.getBuffer()?.slice(0, sliceFrom);
    }
    // console.log(player?.player?.getBuffer()?.duration);
    if (sliceTo > 0) {
      buffer2 = player?.player?.getBuffer()?.slice(sliceTo);
    } 
    if (!buffer1 && !buffer2) {
        console.log('in sliceTrack: buffers are empty');
        return;
    }
    if (buffer1 && buffer2) {
      newBuffer = utils.concat(buffer1.get(), buffer2.get());
    } else if (buffer1) {
      newBuffer = buffer1;
    } else if (buffer2) {
      newBuffer = buffer2;
    }
    player?.player?.getBuffer().set(newBuffer);
    player?.setPeaksBuffer(newBuffer);
    slices.push([sliceFrom, sliceTo]);
  }

  const deleteTrack = (id : string, type: string) => {
    if(window.confirm("Are you sure you want to delete this track?")) {
      if (type === 'synth') {
        let map = new Map(synthTracks);
        map.get(id)?.synth.dispose();
        map.delete(id);
        setSynthTracks(map);
      } else {
        let map = new Map(audioTracks);
        map.delete(id);
        setAudioTracks(map);
      }
      setDeletedTracks([...deletedTracks, {id: id, type: type}]);
    }
  }

  const setTracksInMap = (tracksData: {url: string; id: string;}[], map: Map<string, AudioTrackData>, type: string ) => {
    tracksData.forEach((trackData) => {
      let track: AudioTrackData = {
        type: type,
        player: new PeaksPlayer(),
        url: trackData.url,
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
        trackInfo: undefined,
        slices: [],
      }
      map.set(trackData.id, track);
    });
  }

  const createFromJson = async (projectUrls: ProjectUrls) => {
    console.log(projectUrls);
    let audioTracksMap = new Map();
    setTracksInMap(projectUrls.recorded, audioTracksMap, 'recorded');
    setTracksInMap(projectUrls.uploaded, audioTracksMap, 'uploaded');
    if (projectUrls.json.length) {
      const projectJson = (await axios.get(projectUrls.json[0])).data;
      console.log(projectJson);
      let synthTracksMap = new Map();
      projectJson.synthTracks?.forEach((trackData: any) => {
        // console.log(data);
        const newMap = new Map();
        const newSynth = new Tone.PolySynth().toDestination();
        newSynth.sync();
        let length = 0;
        trackData.data.activeChords?.forEach((chordData: any) => {
          let chord = chordData.data;
          length += chord.duration;
          newMap.set(chordData.id, chord);
          const notes = chordToNotes.get(chord.name);
          if (!notes) return;
          newSynth.triggerAttackRelease(notes, chord.durationStr, chord.startTime);
        })
        let track: STData = {
          activeChords: newMap,
          chordsOrder: trackData.data.chordsOrder,
          synth: newSynth,
          length: length,
        }
        synthTracksMap.set(trackData.id, track);
      });
      projectJson.audioTracks?.forEach((trackInfo: any) => {
        let track: AudioTrackData = audioTracksMap.get(trackInfo.trackId);
        if (!track) return;
        track.trackInfo = trackInfo;
      })
      setSynthTracks(synthTracksMap);
    }
    setAudioTracks(audioTracksMap);
    setGetAlertOpen(false);
    setGetSuccessOpen(true);
  }

  const saveProject = async () => {
    setSaveAlertOpen(true);
    sendAudioTracks();
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    const jsonType = 'application/json';
    const presignedData = await axios.get(
      baseUrl + 'project/presigned_put_url/?project_id=' + props.projectId + "&filename=project.json&content=" + jsonType,
      options
    );
    // console.log(presignedData);
    function replacer(key: any, value: any) {
      if (key === 'synth') return undefined;
      else if (value instanceof Map) {
        return Array.from(value.entries()).map(([id, data]) => {
          return {
            id: id,
            data: data,
          };
        })
      } else return value;
    }
    const tracksInfo: TrackInfo[] = Array.from(audioTracks.entries()).map(([id, data]) => {
      return {
        trackId: id,
        trackType: data.type,
        reverb: data.effects.reverb.level,
        distortion: data.effects.distortion.level,
        tremolo: data.effects.tremolo.level,
        slices: data.slices.map((slice) => [Number(slice[0]), Number(slice[1])]),
      }
    });
    let json = {
      synthTracks: synthTracks,
      audioTracks: tracksInfo,
    }
    axios.put(presignedData.data, JSON.stringify(json, replacer), {headers: {
      'Content-Type': jsonType
    }})
    .then(function (response) {
      console.log(response);
    }).catch(function (error) {
      console.log(error);
    });
    let files =  deletedTracks.map((track) => {
      return {
        'file_name': track.type + "_" + track.id
      }
    });
    let deletedTracksJson = {
      files: files,
    }
    // console.log(deletedTracksJson);
    if (deletedTracks.length > 0) axios.post(baseUrl + 'project/delete_files/?project_id=' + props.projectId, deletedTracksJson, options)
    .catch(e => console.log(e));
    setSaveAlertOpen(false);
    setSaveSuccessOpen(true);
    props.setProjectSaved(true);
  }

  const sendAudioTracks = () => {
    const options = {
      withCredentials :true,
      headers: {
      'Access-Control-Allow-Credentials':'true'
      }
    };
    audioTracks.forEach(async (value, key) => {
      let contentType = value.type === 'recorded' ? 'audio/webm;codecs=opus' : 'audio/mpeg';
      let postfix = value.type === 'recorded' ? '.webm' : '.mp3';
      const presignedData = await axios.get(
        baseUrl + 'project/presigned_put_url/?project_id=' + props.projectId + "&filename=" + value.type + "_" + key + postfix + 
        "&content=" + contentType, options
      );
      console.log(presignedData);
      let blob = value.file;
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

  const recordProject = async () => {
    console.log(longestTrack);
    let toneRecorder = new Tone.Recorder();
    try {
      Tone.getDestination().connect(toneRecorder);
      toneRecorder.start();
      Tone.Transport.start();
      setTimeout(async () => {
        Tone.Transport.stop();
        const recording = await toneRecorder.stop();
        const url = URL.createObjectURL(recording);
        const anchor = document.createElement("a");
        anchor.download = props.projectName + ".webm";
        anchor.href = url;
        anchor.click();
      }, (longestTrack * 1000) + 500);
      } catch(e) {
        console.log(e);
      }
  }

  const getSnackBars = () => {
    return <div>
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={saveAlertOpen}
        autoHideDuration={6000}>
        <Alert severity="info">
          Saving your projects (might take a few seconds)...
        </Alert>
      </Snackbar>
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        open={saveSuccessOpen}
        onClose={() => setSaveSuccessOpen(false)}>
        <Alert severity="success">
          Project saved!
        </Alert>
      </Snackbar>
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={getAlertOpen}
        autoHideDuration={6000}>
        <Alert severity="info">
          Getting your project (might take a few seconds)...
        </Alert>
      </Snackbar>
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        open={getSuccessOpen}
        onClose={() => setGetSuccessOpen(false)}>
        <Alert severity="success">
          Project ready!
        </Alert>
      </Snackbar>
    </div>
  }

  return (
    <Box className={classes.box}>
      {getSnackBars()}
      <div style={{width: '120px', float: 'left'}}>
        <Metronome viewOnly={props.viewOnly}/>
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
          <Button disabled={props.viewOnly} className={classes.button} color='secondary' variant='contained' size='small' 
            onClick={() => addAudioTrack('recorded')}>Add recording track</Button>
          <Button disabled={props.viewOnly} className={classes.button} color='secondary' variant='contained' size='small' 
            onClick={addSynthTrack}>Add synth track</Button>
          <Button disabled={props.viewOnly} className={classes.button} color='secondary' variant='contained' size='small' 
            onClick={() => addAudioTrack('uploaded')}>Add track for uploading</Button>
          <Button disabled={props.viewOnly} className={classes.button} color='primary' variant='contained' size='small' 
            onClick={saveProject}>Save Project</Button>
          <Button disabled={props.viewOnly} className={classes.button} color='primary' variant='contained' size='small' 
            onClick={recordProject}>Download project to file</Button>
        </Box>
      </div>
      {(audioTracks.size !==0 || synthTracks.size !== 0) && 
        <Box className={classes.tracksContainer}>
          {Array.from(audioTracks).map(([id, data]) => {
            let track = data.type === 'recorded' ?
            <RecordedTrack
              id={id} 
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
              setFile={setAudioTrackFile}
              trackInfo={data.trackInfo}
              key={id}
              viewOnly={props.viewOnly}
            /> :
            <UploadedTrack
              player={data.player}
              effects={data.effects}
              url={data.url ? data.url : undefined}
              id={id}
              deleteTrack={deleteTrack}
              slice={sliceTrack}
              addEffect={addEffect}
              setFile={setAudioTrackFile}
              trackInfo={data.trackInfo}
              key={id}
              longestTrack={longestTrack}
              setLongestTrack={handleLongestTrack}
              viewOnly={props.viewOnly}
            />;
            return track;
          })}
          {Array.from(synthTracks).map(([id, data]) => {
            return <SynthTrack
              id={id}
              length={data.length}
              setLength={setSTLength}
              activeChords={data.activeChords}
              chordsOrder={data.chordsOrder}
              synth={data.synth}
              setActiveChords={setSTActiveChords}
              setChordsOrder={setSTChordsOrder}
              setSynth={setSTSynth}
              deleteTrack={deleteTrack}
              key={id}
              viewOnly={props.viewOnly}
            />
          })}
        </Box>
      }
    </Box>
  );
}
  
export default Editor;
