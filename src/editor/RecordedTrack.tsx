import { useEffect, useRef, useState } from 'react';
import { Button, Card, ButtonGroup, Grid, Menu, MenuItem } from '@material-ui/core';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
// import Waveform from '../Waveform';
import { Effects, Recorder, UserMedia, PeaksPlayer } from '../ToneComponents';
import { PlayArrow } from '@material-ui/icons';
import React from 'react';

type Props = {
    recorder: Recorder | undefined;
    userMic: UserMedia | undefined;
}

const RecordedTrack: React.FC<Props> =  (props) => {
    const [track, setTrack] = useState<string>('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [player,setPlayer] = useState<PeaksPlayer | undefined>(undefined);
    const zoomRef = useRef(null);
    const overviewRef = useRef(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    useEffect(() => {
        async function initProps() {
            const {recorder, userMic} = props;
            if (!(recorder && userMic)){
                console.log('props are undefined'); 
                return;
            }
            await userMic.open();
            userMic.connect(recorder);
        }  
      
        initProps();
    }, [props]);

    useEffect(() => {
        const newPlayer = new PeaksPlayer({
            zoomRef: zoomRef,
            overviewRef: overviewRef
        });
        setPlayer(newPlayer);
    }, []);

    const startRecording = () => {
        // if (!userMic || !recorder) {
        //     console.log('user mic or recorder is undefined');
        //     return;
        // }
        const recorder = props.recorder?.get();
        if (!recorder) return;
        if (recorder.state === "started") {
            console.log('Recorder already recording');
            return;
        }
        recorder.start();
        console.log('recording');
    }
    
    const stopRecording = async () => {
        const recorder = props.recorder?.get();
        if (!recorder) return;
        if (!recorder) {
            console.log('Recorder not set');
            return;
        }
        if (recorder.state === "stopped") {
            console.log('Recorder already stopped');
            return;
        } else {
            const data = await recorder.stop();
            console.log(data);
            const url = URL.createObjectURL(data);
            setTrack(url);
            // if (!props.player?.getWavesurfer()) {
            //     props.player?.init(waveformRef.current);
            //     props.player?.sync();
            // }
            // await props.player?.load(url);
            player?.load(url);
            console.log('stopped');
        }
    }

    const pauseRecording = async () => {
        const recorder = props.recorder?.get();
        if (!recorder) return;
        if (!recorder) {
            console.log('Recorder not set');
            return;
        }
        if (recorder.state === "paused") {
            console.log('Recorder already paused');
            return;
        } else if (recorder.state === "stopped") {
            console.log('Recorder already stopped');
            return;
        } else {
            recorder.pause();
        }
    }

    const playTrack = async () => {
        if (track === '') {
            console.log("Track doesn't exist");
            return;
        }
        if (!player) return;
        player.play();
    }

    const stopTrack = () => {
        if (!player) {
            console.log('player undefined');
            return;
        }
        if (track === '') {
            console.log("Track doesn't exist");
            return;
        }
        player.stop();
    }

    const pauseTrack = () => {
        if (!player) {
            console.log('player undefined');
            return;
        }
        if (track === '') {
            console.log("Track doesn't exist");
            return;
        }
        player.player?.pause();
    }

    const addEffect = (effect: string) => {
        if (!player) {
            console.log('player undefined');
            return;
        }
        if (effect === 'reverb') {
           player.connect(Effects.getReverb(3));
        } else if (effect === 'distortion') {
            player.connect(Effects.getDistortion()); 
        }
    }
    
    return (
      <Card>
          <Grid container>
            <Grid item xs={2}>
                <ButtonGroup size="small" style={{marginTop: '10px'}}>
                    <Button onClick={startRecording}>
                        <RadioButtonCheckedIcon color='error'/>
                    </Button>
                    <Button onClick={pauseRecording}>
                        <PauseIcon/>
                    </Button>
                    <Button onClick={stopRecording}>
                        <StopIcon/>
                    </Button>
                </ButtonGroup>
                <ButtonGroup size="small">
                    <Button onClick={playTrack}>
                        <PlayArrow/>
                    </Button>
                    <Button onClick={pauseTrack}>
                        <PauseIcon/>
                    </Button>
                    <Button onClick={stopTrack}>
                        <StopIcon/>
                    </Button> 
                </ButtonGroup>
                <Button onClick={handleClick}>Add effect</Button>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => addEffect('reverb')}>Reverb</MenuItem>
                    <MenuItem onClick={() => addEffect('distortion')}>Distortion</MenuItem>
                    <MenuItem>Vibrato</MenuItem>
                </Menu>
            </Grid>
            <Grid item xs={9} ref={overviewRef}>
                {/* <div ref={overviewRef}></div> */}
            </Grid>
          </Grid>
          {/* <div ref={zoomRef}></div> */}
      </Card>
    );
  }
  
export default RecordedTrack;