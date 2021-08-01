import { useEffect, useRef, useState } from "react";
import * as Tone from 'tone';
import { Tooltip, Button, Card, Select, Grid, MenuItem, TextField, Popover, Box } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ChordView from "./ChordView";
import { ChordData } from "./Types";

const chords = ['A', 'Am', 'A#', 'Am#', 'B', 'Bm', 'C', 'Cm', 'C#', 'Cm#', 'D', 'Dm',
 'D#', 'Dm#', 'E', 'Em', 'F', 'Fm', 'F#', 'Fm#', 'G', 'Gm', 'G#', 'Gm#'];

const chordToNotes = new Map([
    ['A', ['A4', 'C#4', 'E4']],
    ['Am', ['A4', 'C4', 'E4']],
    ['A#', ['A#4', 'D4', 'F4']],
    ['Am#', ['A#4', 'C#4', 'F4']],
    ['B', ['B4', 'D#4', 'F#4']],
    ['Bm', ['B4', 'D4', 'F#4']],
    ['C', ['C4', 'E4', 'G4']],
    ['Cm', ['C4', 'D#4', 'G4']],
    ['C#', ['C#4', 'F4', 'G#4']],
    ['Cm#', ['C#4', 'E4', 'G#4']],
    ['D', ['D4', 'F#4', 'A4']],
    ['Dm', ['D4', 'F4', 'A4']],
    ['D#', ['D#4', 'G4', 'A#4']],
    ['Dm#', ['D#4', 'F#4', 'A#4']],
    ['E', ['E4', 'G#4', 'B4']],
    ['Em', ['E4', 'G4', 'B4']],
    ['F', ['F4', 'A4', 'C4']],
    ['Fm', ['F4', 'G#4', 'C4']],
    ['F#', ['F#4', 'A#4', 'C#4']],
    ['Fm#', ['F#4', 'A4', 'C#4']],
    ['G', ['G4', 'B4', 'D4']],
    ['Gm', ['G4', 'A#4', 'D4']],
    ['G#', ['G#4', 'C4', 'D#4']],
    ['Gm#', ['G#4', 'B4', 'C#4']]
]);

const colors = ['#f0ccc9', '#f5e1cb', '#edebc7', '#d7e8be', '#c8e6e3', '#c3e3e0'];

type Props = {
    id: string;
    initialLength: number;
    setTracksLength: (value: number) => void;
    synth: Tone.PolySynth;
    activeChords: Map<number,ChordData>;
    chordsOrder: number[];
    setActiveChords: (newActiveChords: Map<number,ChordData>, id: string) => void;
    setChordsOrder: (newOrder: number[], id: string) => void;
    setSynth: (newSynth: Tone.PolySynth, id: string) => void;
    deleteTrack: (id: string, type: string) => void;
}

const SynthTrack: React.FC<Props> = (props) => {
    const [nextId, setNextId] = useState<number>(0);
    const [chord, setChord] = useState<string>("A");
    const [duration, setDuration] = useState<string>("0");
    const [currEndTime, setCurrEndTime] = useState<number>(0);
    const [chordMenuOpen, setChordMenuOpen] = useState<boolean>(false);
    const chordMenuRef = useRef(null);
    const widthRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        props.synth.sync();
    }, [props.synth]);

    const addChord = () => {
        const {id, synth, activeChords, chordsOrder, setActiveChords, setChordsOrder} = props;
        if (duration === '0') {
            setChordMenuOpen(false);
            return;
        }
        const notes = chordToNotes.get(chord);
        if (!notes) {
            console.log("chord wasn't found");
            return;
        }
        const durationSeconds = Tone.Time(duration).toSeconds();
        const newChord: ChordData = {
            name: chord,
            id: nextId,
            duration: durationSeconds,
            durationStr: duration,
            startTime: currEndTime
        };
        synth.triggerAttackRelease(notes, duration, currEndTime);
        const newEndTime = currEndTime + durationSeconds;
        
        // if (newEndTime > props.tracksLength) props.setTracksLength(newEndTime);
        setActiveChords(new Map(activeChords).set(nextId, newChord), id);
        setChordsOrder([...chordsOrder, nextId], id);
        setCurrEndTime(newEndTime);
        setChordMenuOpen(false);
        setNextId(nextId + 1);
    }

    const handleChordChange = (e: any) => {
        setChord(e.target.value);
    }

    const handleDurationChange = (e: any) => {
        setDuration(e.target.value);
    }

    const onChordMoved = (chordId: number, oldPosition: number, newPosition: number, duration: number) => {
        const {id, synth, setSynth, setChordsOrder, activeChords, chordsOrder} = props;
        if (newPosition === oldPosition) return;
        const idx = chordsOrder.indexOf(chordId);
        const data = activeChords.get(chordId);
        if (!data) {
            console.log("chord id doesn't exist in activeChords");
            return;
        }
        let chordsOrderCopy = [...chordsOrder];
        //chordsOrderCopy.splice(idx, 1);
        const newSynth = new Tone.PolySynth().toDestination().sync();

        if (!widthRef.current?.offsetWidth) {
            console.log('ref to synth track is null');
            return;
        }
        const newStartTime = newPosition / widthRef.current?.offsetWidth * currEndTime;

        if (newPosition < oldPosition) {
            let foundSpot = false;
            chordsOrder.forEach((currId, index) => {
                if (index === idx) return;
                const currData = activeChords.get(currId);
                if (!currData) return;
                const notes = chordToNotes.get(currData?.name);
                if (!notes) return;
                if(!currData) return;
                if (foundSpot) {
                    currData.startTime += duration;
                }
                else if (currData.startTime + currData.duration > newStartTime) {
                    chordsOrderCopy.splice(idx, 1);
                    chordsOrderCopy.splice(index, 0, chordId);
                    foundSpot = true;
                    data.startTime = currData.startTime;
                    currData.startTime += duration;
                }
                newSynth.triggerAttackRelease(notes, currData.durationStr, currData.startTime);
            });
        } else {
            let foundStop = false;
            for (let i = 0; i < chordsOrderCopy.length; i++) {
                const currData = activeChords.get(chordsOrderCopy[i]);
                if (!currData) return;
                const notes = chordToNotes.get(currData.name);
                if(!notes) return;
                if (i > idx && !foundStop) {
                    if (newStartTime >= currData.startTime && newStartTime < currData.startTime + currData.duration) {
                        data.startTime = currData.startTime;
                        currData.startTime -= duration;
                        chordsOrderCopy.splice(idx, 1);
                        chordsOrderCopy.splice(i, 0, chordId);
                        foundStop = true;
                    } else {
                        currData.startTime -= duration;
                    }
                }
                if (i !== idx) newSynth.triggerAttackRelease(notes, currData.durationStr, currData.startTime);
            }
        }
        const notes = chordToNotes.get(data.name);
        if (!notes) return;
        newSynth.triggerAttackRelease(notes, data.durationStr, data.startTime);
        synth.dispose();
        setSynth(newSynth, id);
        setChordsOrder(chordsOrderCopy, id);
    }

    const deleteChord = (chordId: number) => {
        const {id, setChordsOrder, chordsOrder, setActiveChords, activeChords, synth, setSynth} = props;
        const idx = chordsOrder.indexOf(chordId);
        const newMap = new Map(activeChords);
        const newOrder = [...chordsOrder];
        newOrder.splice(idx, 1);
        const newSynth = new Tone.PolySynth().toDestination().sync();
        let pushBack = false;
        let dur = newMap.get(chordId)?.duration;
        chordsOrder.forEach((currId) => {
            if (currId === chordId) {
                pushBack = true;
                return;
            }
            const data = newMap.get(currId);
            const notes = data ? chordToNotes.get(data.name) : null;
            if (data && notes) {
                if (pushBack) {
                    data.startTime -= dur ? dur : 0;
                }
                newSynth.triggerAttackRelease(notes, data.durationStr, data.startTime);  
            }
        });
        newMap.delete(chordId);
        synth.dispose();
        setActiveChords(newMap, id);
        setChordsOrder(newOrder, id);
        setSynth(newSynth, id);
        setCurrEndTime(dur ? currEndTime - dur : currEndTime);
    }

    const deleteTrack = () => {
        if(window.confirm("Detele this track?")) {
            props.synth.dispose();
            props.deleteTrack(props.id, 'synth');
        }
    }

    const getChordViews = () => {
        const {chordsOrder, activeChords} = props;
        if (!chordsOrder || !activeChords) return;
        return chordsOrder.map((id, index) => {
            const currData = activeChords.get(id);
            if (!currData) {
                console.log('chord not found in map');
                return null;
            };
            const totalTime = currEndTime === 0 ? props.initialLength : currEndTime; 
            return <ChordView
                chordName={currData.name}
                id={id}
                width={widthRef.current ? widthRef.current.offsetWidth * (currData.duration / totalTime) : 0}
                duration={currData.duration}
                onStop={onChordMoved}
                position={widthRef.current ? widthRef.current.offsetWidth * (currData.startTime / totalTime) : 0}
                startTime={currData.startTime}
                wholeTrackWidth={widthRef.current ? widthRef.current.offsetWidth : 0}
                color={colors[index]}
                deleteChord={deleteChord}
                key={index}
            />
        })   
    }

    return(
        <Card variant="outlined">
          <Grid container>
            <Grid item xs={1} style={{padding: '10px'}}>
                <Button style={{margin: '10px'}} size='small' ref={chordMenuRef} onClick={() => setChordMenuOpen(true)} variant='outlined'>
                    add chord
                </Button>
                <Tooltip
                    title="Delete Track"
                    placement="top"
                >
                    <Button size='small' variant='outlined' onClick={() => deleteTrack()}>
                        <DeleteIcon />
                    </Button>
                </Tooltip>
                <Popover
                    anchorEl={chordMenuRef.current}
                    open={chordMenuOpen}
                >
                    <Box display="flex" flexDirection="column">
                        <Select
                            id="select-chord"
                            value={chord}
                            onChange={handleChordChange}
                        >
                            {chords.map((item, index) => {
                                return <MenuItem key={index.toString()} value={item}>{item}</MenuItem>
                            })}
                        </Select>
                        <TextField label="Duration" value={duration} onChange={handleDurationChange}/>
                        <Button onClick={addChord}>Apply</Button>
                    </Box>  
                </Popover>
            </Grid>
            <Grid item xs={11} ref={widthRef}>
                <div style={{display: 'flex', justifyContent: 'flex-start', height: '100px'}}>
                    {widthRef.current && getChordViews()}
                </div>
            </Grid>
          </Grid>
      </Card>
    );
}

export {SynthTrack, chordToNotes};