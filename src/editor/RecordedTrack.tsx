import { useEffect, useRef, useState } from 'react';
import { Button, Card, ButtonGroup, Grid, Menu, MenuItem, TextField, Popover, Box, Tooltip } from '@material-ui/core';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import { Effects, Recorder, UserMedia, PeaksPlayer } from '../ToneComponents';
import FlareIcon from '@material-ui/icons/Flare';
import CropIcon from '@material-ui/icons/Crop';
import React from 'react';
import * as utils from 'audio-buffer-utils';

type Props = {
    recorder: Recorder | undefined;
    userMic: UserMedia | undefined;
    tracksLength: number;
    setTracksLength: (value: number) => void;
    setEmitter: (emitter: any) => void;
}

const RecordedTrack: React.FC<Props> =  (props) => {
    const [track, setTrack] = useState<string>('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [player,setPlayer] = useState<PeaksPlayer>();
    const [slice, setSlice] = useState<boolean>(false);
    const [sliceFrom, setSliceFrom] = useState<number>(0);
    const [sliceTo, setSliceTo] = useState<number>(0);
    const zoomRef = useRef(null);
    const overviewRef = useRef(null);
    const sliceRef = useRef(null);

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
            overviewRef: overviewRef,
            setEmitter: props.setEmitter,
        });
        setPlayer(newPlayer);
    }, [props.setEmitter]);

    useEffect(() => {
        player?.peaks?.views.getView('zoomview')?.setZoom({seconds: props.tracksLength});
        console.log('in useEffect');
    }, [props.tracksLength, player]);

    const startRecording = () => {
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
            await player?.load(url);
            const length = player?.player?.getBuffer()?.duration;
            console.log(length);
            if ( length && length > props.tracksLength) {
                props.setTracksLength(length);
                console.log('sdfg');
            }
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

    // const playTrack = async () => {
    //     if (track === '') {
    //         console.log("Track doesn't exist");
    //         return;
    //     }
    //     if (!player) return;
    //     player.play();
    // }

    // const stopTrack = () => {
    //     if (!player) {
    //         console.log('player undefined');
    //         return;
    //     }
    //     if (track === '') {
    //         console.log("Track doesn't exist");
    //         return;
    //     }
    //     player.stop();
    // }

    // const pauseTrack = () => {
    //     if (!player) {
    //         console.log('player undefined');
    //         return;
    //     }
    //     if (track === '') {
    //         console.log("Track doesn't exist");
    //         return;
    //     }
    //     player.player?.pause();
    // }

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

    const handleSliceFrom = (e: any) => {
        setSliceFrom(e.target.value);
    }

    const handleSliceTo = (e: any) => {
        setSliceTo(e.target.value);
    }

    const sliceTrack = () => {
        if (sliceFrom === sliceTo) {
            setSlice(false);
            return;
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
        setSlice(false);
        setSliceFrom(0);
        setSliceTo(0);
    }

    const renderControls = () => {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
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
                {/* <ButtonGroup size="small">
                    <Button onClick={playTrack}>
                        <PlayArrow/>
                    </Button>
                    <Button onClick={pauseTrack}>
                        <PauseIcon/>
                    </Button>
                    <Button onClick={stopTrack}>
                        <StopIcon/>
                    </Button> 
                </ButtonGroup> */}
                <ButtonGroup size="small" style={{marginTop: '10px', marginBottom: '10px'}}>
                    <Tooltip
                        title="Add Effect"
                        placement="top"
                    >
                        <Button onClick={handleClick} size="small" variant="outlined">
                            <FlareIcon/>
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title="Slice"
                        placement="top"
                    >
                        <Button ref={sliceRef} onClick={() => setSlice(!slice)}>
                            <CropIcon/>
                        </Button>
                </Tooltip>
                </ButtonGroup>
            </Box>
        );
    }
    
    return (
      <Card variant="outlined">
          <Grid container>
            <Grid item xs={2}>
                {renderControls()}
                <Popover
                    anchorEl={sliceRef.current}
                    open={slice}
                >
                    <Box display="flex" flexDirection="column">
                        <TextField label="From" value={sliceFrom} onChange={handleSliceFrom}/>
                        <TextField label="To" value={sliceTo} onChange={handleSliceTo}/>
                        <Button onClick={sliceTrack}>Apply</Button>
                    </Box>  
                </Popover>
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
            <Grid item xs={9} ref={zoomRef}>
            </Grid>
          </Grid>
      </Card>
    );
  }
  
export default RecordedTrack;