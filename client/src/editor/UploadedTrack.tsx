import {  useEffect, useRef, useState } from 'react';
import { Button, Card, ButtonGroup, Grid, Menu, MenuItem, TextField, Popover, Box, Tooltip, Slider, makeStyles } from '@material-ui/core';
import { PeaksPlayer } from '../ToneComponents';
import FlareIcon from '@material-ui/icons/Flare';
import CropIcon from '@material-ui/icons/Crop';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import {useDropzone} from 'react-dropzone';
import { EffectsData } from './Types';

type Props = {
    id: number;
    player: PeaksPlayer;
    url: string | undefined;
    effects: EffectsData;
    deleteTrack: (idx: number, type: string) => void;
    addEffect: (effect: string, value: number, type: string, id: number) => void;
    slice: (sliceFrom: number, sliceTo: number, trackType: string, id: number) => void;
    setFile: (file: Blob, id: number) => void;
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
    const [playerLoaded, setPlayerLoaded] = useState<boolean>(false);
    const [reverbValue, setReverbValue] = useState<number>(0);
    const [distortionValue, setDistortionValue] = useState<number>(0);
    const [tremoloValue, setTremoloValue] = useState<number>(0);
    const zoomRef = useRef(null);
    const overviewRef = useRef(null);
    const sliceRef = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        async function initProps() {  
            if (props.url && !playerLoaded) {
                console.log('loading url');
                setPlayerLoaded(true);
                await props.player?.load(props.url, zoomRef, overviewRef);
            }
        }  
      
        initProps();
    }, [props, playerLoaded]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    }

    const acceptFile = (files: any, e: any) => {
        console.log(files);
        const url = URL.createObjectURL(files[0]);
        console.log(url);
        props.player.load(url, zoomRef, overviewRef);
        props.setFile(files[0], props.id);
    }

    const {getRootProps, getInputProps} = useDropzone({
        accept: 'audio/*',
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
        props.slice(sliceFrom, sliceTo, 'recorded', props.id);
        setSlice(false);
        setSliceFrom(0);
        setSliceTo(0);
    }

    const deleteTrack = () => {
        if(window.confirm("Detele this track?")) {
            props.player.dispose();
            props.deleteTrack(props.id, 'uploaded');
        }
    }

    const renderControls = () => {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
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
                            props.addEffect('reverb', value as number, 'uploaded', props.id);
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
                        props.addEffect('distortion', value as number, 'uploaded', props.id)
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
                        props.addEffect('tremolo', value as number, 'uploaded', props.id);
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
            <Grid item xs={1} style={{position: 'relative'}}>
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
                    <MenuItem onClick={() => props.addEffect('reverb', reverbValue, 'uploaded', props.id)}>Reverb</MenuItem>
                    <MenuItem onClick={() => props.addEffect('distortion', distortionValue, 'uploaded', props.id)}>Distortion</MenuItem>
                    <MenuItem onClick={() => props.addEffect('tremolo', tremoloValue, 'uploaded', props.id)}>Tremolo</MenuItem>
                </Menu>
            </Grid>
            <Grid item xs={10} ref={zoomRef}>
                <div {...getRootProps({className: 'dropzone', style: baseStyle})}>
                    <input {...getInputProps()} />
                    <p>Drag and drop a file here, or click to select file</p>
                </div>
            </Grid>
          </Grid>
      </Card>
    );
  }
  
export default UploadedTrack;