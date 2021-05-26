import {  useRef, useState } from 'react';
import { Button, Card, ButtonGroup, Grid, Menu, MenuItem, TextField, Popover, Box, Tooltip } from '@material-ui/core';
import { Effects, PeaksPlayer } from '../ToneComponents';
import FlareIcon from '@material-ui/icons/Flare';
import CropIcon from '@material-ui/icons/Crop';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import * as utils from 'audio-buffer-utils';
import {useDropzone} from 'react-dropzone';

type Props = {
    id: number;
    player: PeaksPlayer;
    deleteTrack: (idx: number, type: string) => void;
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
  

const UploadedTrack: React.FC<Props> =  (props) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
    }

    const acceptFile = (files: any, e: any) => {
        console.log(files);
        const url = URL.createObjectURL(files[0]);
        console.log(url);
        props.player.load(url, zoomRef, overviewRef);
    }

    const {getRootProps, getInputProps} = useDropzone({
        accept: 'audio/*',
        onDrop: acceptFile,
        maxFiles: 1,
      });

    const addEffect = (effect: string) => {
        const {player} = props;
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
        const {player} = props;
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
                    <MenuItem onClick={() => addEffect('reverb')}>Reverb</MenuItem>
                    <MenuItem onClick={() => addEffect('distortion')}>Distortion</MenuItem>
                    <MenuItem>Vibrato</MenuItem>
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