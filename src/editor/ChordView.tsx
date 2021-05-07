import { useState } from "react";
import { Paper } from '@material-ui/core';
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
    color: string;
};


const ChordView: React.FC<Props>= (props) => {
    const [position, setPosition] = useState({x: 0, y: 0});

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
                position={position}
            >
                <Paper 
                    style={{
                        display: 'inline-flex', height: '95px', width: props.width, justifyContent: 'center', alignItems: 'center', backgroundColor: props.color}}
                    elevation={3}
                >
                    {props.chordName}
                </Paper>
            </Draggable>
        </div>
    );
};

export default ChordView;