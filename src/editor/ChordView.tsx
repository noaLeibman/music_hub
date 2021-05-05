import { duration, Paper } from '@material-ui/core';
import { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';


type Props = {
    onStop: (id: number, oldPosition: number, newPosition: number, duration: number) => void;
    chordName: string;
    id: number;
    width: number;
    duration: number;
    position: number;
    startTime: number;
    wholeTrackWidth: number;
};


const ChordView: React.FC<Props>= (props) => {

    const onStop = (e: DraggableEvent, data: DraggableData): void | false => {
       props.onStop(props.id, props.position, props.position + data.x, props.duration);
       console.log('onStop in ChordView');
    };

    return(
        <div style={{ width: props.wholeTrackWidth + 'px'}}>
            <Draggable
                axis="x"
                bounds={{left: -props.position}}
                onStop={onStop}
            >
                <Paper 
                    style={{
                        height: '95px', width: props.width, alignContent: 'center', position: 'absolute'}}
                    elevation={3}
                >
                    {props.chordName}
                </Paper>
            </Draggable>
        </div>
    );
};

export default ChordView;