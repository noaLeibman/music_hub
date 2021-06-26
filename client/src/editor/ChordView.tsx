import React, { useState } from "react";
import { IconButton, makeStyles, Paper } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

const useStyles = makeStyles({
    chordDiv: {
        position: 'relative',
    },
    button: {
        position: 'absolute',
        top: '0px',
        right: '0px',
    },
  });

type Props = {
    onStop: (id: number, oldPosition: number, newPosition: number, duration: number) => void;
    chordName: string;
    id: number;
    width: number;
    duration: number;
    position: number;
    startTime: number;
    wholeTrackWidth: number;
    color: string;
    deleteChord: (id: number) => void;
};


const ChordView: React.FC<Props>= (props) => {
    const [position, setPosition] = useState({x: 0, y: 0});

    const classes = useStyles();

    const onStop = (e: DraggableEvent, data: DraggableData): void | false => {
       props.onStop(props.id, props.position, props.position + data.x, props.duration);
       console.log('onStop in ChordView');
    };

    return(
        <div style={{ width: props.wholeTrackWidth + 'px', position: 'relative'}}>
            <Draggable
                axis="x"
                bounds={{left: -props.position}}
                onStop={onStop}
                position={position}
            >
                <Paper 
                    style={{
                        display: 'inline-flex', height: '95px', width: props.width, justifyContent: 'center', alignItems: 'center', backgroundColor: props.color}}
                    elevation={3}
                >
                    <IconButton size="small" aria-label="delete" className={classes.button} onClick={() => props.deleteChord(props.id)}>
                        <DeleteIcon />
                    </IconButton>
                    {props.chordName}
                </Paper>
            </Draggable>
        </div>
    );
};

export default ChordView;