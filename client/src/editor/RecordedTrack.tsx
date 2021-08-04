import { useEffect, useRef, useState } from 'react';
import { Button, Card, ButtonGroup, Grid, Menu, MenuItem, TextField, Popover, Box, Tooltip, Slider, makeStyles } from '@material-ui/core';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import { Recorder, UserMedia, PeaksPlayer } from '../ToneComponents';
import FlareIcon from '@material-ui/icons/Flare';
import CropIcon from '@material-ui/icons/Crop';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import { EffectsData, TrackInfo } from './Types'

const useStyles = makeStyles({
    slider: {
        maxWidth: '70%',
    },
    effectIcon: {
        maxWidth: '30%',
    },
});

type Props = {
    id: string
    player: PeaksPlayer;
    effects: EffectsData;
    recorder: Recorder | undefined;
    userMic: UserMedia | undefined;
    tracksLength: number;
    setTracksLength: (value: number) => void;
    deleteTrack: (id: string, type: string) => void;
    url: string | undefined;
    addEffect: (effect: string, value: number, id: string) => void;
    slice: (sliceFrom: number, sliceTo: number, id: string) => void;
    setFile: (file: Blob, id: string) => void;
    trackInfo: TrackInfo | undefined;
}

const RecordedTrack: React.FC<Props> =  (props) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [slice, setSlice] = useState<boolean>(false);
    const [sliceFrom, setSliceFrom] = useState<number>(0);
    const [sliceTo, setSliceTo] = useState<number>(0);
    const [needLoading, setNeedLoading] = useState<boolean>(true);
    const [playerLoaded, setPlayerLoaded] = useState<boolean>(false);
    const [trackInfoApplied, setTrackInfoApplied] = useState<boolean>(false);
    const [reverbValue, setReverbValue] = useState<number>(0);
    const [distortionValue, setDistortionValue] = useState<number>(0);
    const [tremoloValue, setTremoloValue] = useState<number>(0);
    const zoomRef = useRef(null);
    const overviewRef = useRef(null);
    const sliceRef = useRef(null);

    const classes = useStyles();

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
            if (props.url && needLoading) {
                console.log('loading url');
                setNeedLoading(false);
                await props.player?.load(props.url, zoomRef, overviewRef).then(() => setPlayerLoaded(true));
                const length = props.player?.player?.getBuffer()?.duration;
                if ( length && length > props.tracksLength) {
                    props.setTracksLength(length);
                }
            }
        }  
      
        initProps();
    }, [props, needLoading, playerLoaded]);

    useEffect(() => {
        if (!trackInfoApplied && playerLoaded) {
            setTrackInfoApplied(true);
            props.trackInfo?.slices.forEach((slice: number[]) => {
                props.slice(slice[0], slice[1], props.id);
            })
            if (props.trackInfo?.reverb) {
                props.addEffect('reverb', props.trackInfo.reverb, props.id);
                setReverbValue(props.trackInfo.reverb);
            }
            if (props.trackInfo?.distortion) {
                props.addEffect('distortion', props.trackInfo.distortion, props.id);
                setDistortionValue(props.trackInfo.distortion);
            }
            if (props.trackInfo?.tremolo) {
                props.addEffect('tremolo', props.trackInfo.tremolo, props.id);
                setTremoloValue(props.trackInfo.tremolo);
            } 
        }
    }, [props, playerLoaded, trackInfoApplied, reverbValue, tremoloValue, distortionValue]);

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
            props.setFile(data, props.id);
            console.log('recorded data is: ' + data.type);
            const url = URL.createObjectURL(data);
            await props.player?.load(url, zoomRef, overviewRef);
            const length = props.player?.player?.getBuffer()?.duration;
            if ( length && length > props.tracksLength) {
                props.setTracksLength(length);
            }
            console.log('stopped');
            // console.log(props.player?.player?.getBuffer().numberOfChannels);
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

    const handleSliceFrom = (e: any) => {
        setSliceFrom(e.target.value);
    }

    const handleSliceTo = (e: any) => {
        setSliceTo(e.target.value);
    }

    const sliceTrack = () => {
        props.slice(sliceFrom, sliceTo, props.id);
        setSlice(false);
        setSliceFrom(0);
        setSliceTo(0);
    }

    const deleteTrack = () => {
        if(window.confirm("Delete this track?")) {
            props.player.dispose();
            props.deleteTrack(props.id, 'recorded');
        }
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
                    <Tooltip
                        title="Delete Track"
                        placement="top"
                    >
                        <Button onClick={() => deleteTrack()}>
                            <DeleteIcon />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
                {props.effects.reverb.on && <Tooltip
                    title="Reverb"
                    placement="left"
                >
                    <Slider 
                        value={reverbValue} 
                        onChange={(event: object, value: number | number[]) => setReverbValue(value as number)}
                        onChangeCommitted={(event: object, value: number | number[]) =>{ 
                            props.addEffect('reverb', value as number, props.id);
                        }}
                        min={0}
                        max={10}
                        className={classes.slider}
                        valueLabelDisplay="auto"
                    />  
                </Tooltip>}
                {props.effects.distortion.on && <Tooltip
                    title="Distortion"
                    placement="left"
                >
                    <Slider 
                    value={distortionValue} 
                    onChange={(event: any, newValue: number | number[]) => setDistortionValue(newValue as number)}
                    onChangeCommitted={(event: object, value: number | number[]) => 
                        props.addEffect('distortion', value as number, props.id)
                    }
                    step={0.1}
                    min={0.0}
                    max={1.0}
                    className={classes.slider}
                    valueLabelDisplay="auto"
                />  
                </Tooltip>}
                {props.effects.tremolo.on && <Tooltip
                    title="Tremolo"
                    placement="left"
                >
                    <Slider 
                    value={tremoloValue} 
                    onChange={(event: any, value: number | number[]) => setTremoloValue(value as number)}
                    onChangeCommitted={(event: object, value: number | number[]) => {
                        props.addEffect('tremolo', value as number, props.id);
                    }}
                    min={0}
                    max={10}
                    className={classes.slider}
                    valueLabelDisplay="auto"
                />  
                </Tooltip>}
            </Box>
        );
    }
    
    return (
      <Card variant="outlined">
          <Grid container>
            <Grid item xs={1} style={{position: 'relative', marginLeft: '20px'}}>
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
                    <MenuItem onClick={() => props.addEffect('reverb', reverbValue, props.id)}>Reverb</MenuItem>
                    <MenuItem onClick={() => props.addEffect('distortion', distortionValue, props.id)}>Distortion</MenuItem>
                    <MenuItem onClick={() => props.addEffect('tremolo', tremoloValue, props.id)}>Tremolo</MenuItem>
                </Menu>
            </Grid>
            <Grid item xs={10} ref={zoomRef} style={{marginLeft: '20px'}}>
            </Grid>
          </Grid>
      </Card>
    );
  }
  
export default RecordedTrack;