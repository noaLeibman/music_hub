import {  useEffect, useRef, useState } from 'react';
import { Button, Card, ButtonGroup, Grid, Menu, MenuItem, TextField, Popover, Box, Tooltip, Slider, makeStyles, Snackbar, IconButton } from '@material-ui/core';
import { PeaksPlayer } from '../ToneComponents';
import FlareIcon from '@material-ui/icons/Flare';
import CropIcon from '@material-ui/icons/Crop';
import DeleteIcon from '@material-ui/icons/Delete';
import MicOffIcon from '@material-ui/icons/MicOff';
import React from 'react';
import {useDropzone} from 'react-dropzone';
import { EffectsData, TrackInfo } from './Types';
import { Alert } from '@material-ui/lab';

type Props = {
    id: string;
    player: PeaksPlayer;
    url: string | undefined;
    effects: EffectsData;
    longestTrack: number;
    setLongestTrack: (value: number) => void;
    deleteTrack: (id: string, type: string) => void;
    addEffect: (effect: string, value: number, id: string) => void;
    slice: (sliceFrom: number, sliceTo: number, id: string) => void;
    setFile: (file: Blob, id: string) => void;
    trackInfo: TrackInfo | undefined;
}

const baseStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    margin: '10px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };

const useStyles = makeStyles({
    slider: {
        maxWidth: '70%',
    },
    effectIcon: {
        maxWidth: '30%',
    }
});
  

const UploadedTrack: React.FC<Props> =  (props) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [slice, setSlice] = useState<boolean>(false);
    const [sliceFrom, setSliceFrom] = useState<number>(0);
    const [sliceTo, setSliceTo] = useState<number>(0);
    const [needLoading, setNeedLoading] = useState<boolean>(true);
    const [playerLoaded, setPlayerLoaded] = useState<boolean>(false);
    const [reverbValue, setReverbValue] = useState<number>(0);
    const [distortionValue, setDistortionValue] = useState<number>(0);
    const [tremoloValue, setTremoloValue] = useState<number>(0);
    const [trackInfoApplied, setTrackInfoApplied] = useState<boolean>(false);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [mute, setMute] = useState<boolean>(false);
    const zoomRef = useRef(null);
    const overviewRef = useRef(null);
    const sliceRef = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        async function initProps() {  
            if (props.url && needLoading) {
                console.log('loading url');
                setNeedLoading(false);
                await props.player?.load(props.url, zoomRef, overviewRef).then(() => setPlayerLoaded(true));
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
            props.trackInfo?.reverb && props.addEffect('reverb', props.trackInfo.reverb, props.id);
            props.trackInfo?.distortion && props.addEffect('distortion', props.trackInfo.distortion, props.id);
            props.trackInfo?.tremolo && props.addEffect('tremolo', props.trackInfo.tremolo, props.id);
        }
    }, [props, trackInfoApplied, playerLoaded]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    }

    const acceptFile = (files: any, e: any) => {
        console.log(files);
        if (!files[0]) {
            setAlertOpen(true);
            return;
        }
        const url = URL.createObjectURL(files[0]);
        console.log(url);
        props.player.load(url, zoomRef, overviewRef).then(() => {
            let dur = props.player.player?.getDuration();
            if (dur && dur > props.longestTrack) {
                props.setLongestTrack(dur);
            }
        });
        props.setFile(files[0], props.id);
    }

    const {getRootProps, getInputProps} = useDropzone({
        accept: 'audio/mpeg',
        onDrop: acceptFile,
        maxFiles: 1,
    });

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
            props.deleteTrack(props.id, 'uploaded');
        }
    }

    const muteOrUnmute = () => {
        if (props.player.player){
            props.player.player.externalPlayer.mute = (!mute);
            setMute(!mute);
        }
    }

    const renderControls = () => {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Snackbar 
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={alertOpen}
                    autoHideDuration={2000}
                    onClose={() => setAlertOpen(false)}>
                    <Alert severity="error">
                        Only .mp3 files are accepted
                    </Alert>
                </Snackbar>
                <ButtonGroup size="small" style={{marginTop: '10px'}}>
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
                <Tooltip
                    title={mute ? "unmute" : "mute"}
                    placement="top"
                >
                    <IconButton edge="start" size="small" onClick={muteOrUnmute}>
                        <MicOffIcon color={mute ? "primary" : "disabled"}/>
                    </IconButton>
                </Tooltip>
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
                <div {...getRootProps({className: 'dropzone', style: baseStyle})}>
                    <input {...getInputProps()} />
                    <p>Drag and drop a file here (only mp3 format), or click to select file</p>
                </div>
            </Grid>
          </Grid>
      </Card>
    );
  }
  
export default UploadedTrack;