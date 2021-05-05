import { useEffect, useRef, useState } from "react";
import * as Tone from 'tone';
import { Button, Card, Select, Grid, MenuItem, TextField, Popover, Box } from '@material-ui/core';
import ChordView from "./ChordView";

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
    ['Gm', ['B4', 'A#4', 'D4']],
    ['G#', ['G#4', 'C4', 'D#4']],
    ['Gm#', ['G#4', 'B4', 'C#4']]
]);

type ChordData = {
    id: number;
    name: string;
    duration: number;
    startTime: number;
}
  
const SynthTrack: React.FC = () => {
    const [synth, setSynth] = useState<Tone.PolySynth>(new Tone.PolySynth().toDestination());
    const [activeChords, setActiveChords] = useState<Map<number,ChordData>>(new Map());
    const [chordsOrder, setChordsOrder] = useState<number[]>([]);
    const [nextId, setNextId] = useState<number>(0);
    const [chord, setChord] = useState<string>("A");
    const [duration, setDuration] = useState<string>("0");
    const [currEndTime, setCurrEndTime] = useState<number>(0);
    const [chordMenuOpen, setChordMenuOpen] = useState<boolean>(false);
    const chordMenuRef = useRef(null);
    const widthRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        synth.sync();
    }, [synth]);

    const addChord = () => {
        if (duration === '0') return;
        const notes = chordToNotes.get(chord);
        if (!notes) {
            console.log("chord wasn't found");
            return;
        }
        const newChord: ChordData = {
            name: chord,
            id: nextId,
            duration: Number(duration),
            startTime: currEndTime
        };
        synth.triggerAttackRelease(notes, duration, currEndTime);
        console.log('end time:' + (currEndTime + Tone.Time(duration).toSeconds()));
        console.log(newChord);
        setCurrEndTime(currEndTime + Tone.Time(duration).toSeconds());
        setChordMenuOpen(false);
        setActiveChords(new Map(activeChords.set(nextId, newChord)));
        setChordsOrder([...chordsOrder, nextId]);
        setNextId(nextId + 1);
    }

    const handleChordChange = (e: any) => {
        setChord(e.target.value);
    }

    const handleDurationChange = (e: any) => {
        setDuration(e.target.value);
    }

    const onChordMoved = (id: number, oldPosition: number, newPosition: number, duration: number) => {
        if (newPosition === oldPosition) return;
        const idx = chordsOrder.indexOf(id);
        const data = activeChords.get(id);
        if (!data) {
            console.log("chord id doesn't exist in activeChords");
            return;
        }
        const activeChordsCopy = new Map(activeChords);
        let chordsOrderCopy = [...chordsOrder];
        chordsOrderCopy.splice(idx, 1);
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
                    chordsOrderCopy.splice(index, 0, id);
                    foundSpot = true;
                    data.startTime = currData.startTime;
                    currData.startTime += duration;
                }
                newSynth.triggerAttackRelease(notes, currData.duration, currData.startTime);
            });
        } else {
            let foundSpot = false;
            chordsOrder.forEach((currId, index) => {
                if (index === idx) return;
                const currData = activeChords.get(currId);
                if (!currData) return;
                const notes = chordToNotes.get(currData?.name);
                if(!notes) return;
                if(newStartTime < currData.startTime + currData.duration) {
                    chordsOrderCopy.splice(index - 1, 0, id);
                    foundSpot = true;
                }
                else if (index >= idx && !foundSpot) {
                    data.startTime = currData.startTime;
                    currData.startTime -= duration;
                }
                newSynth.triggerAttackRelease(notes, currData.duration, currData.startTime);
            });
        }
        const notes = chordToNotes.get(data.name);
        if (!notes) return;
        newSynth.triggerAttackRelease(notes, data.duration, data.startTime);
        synth.dispose();
        setSynth(newSynth);
        setChordsOrder(chordsOrderCopy);
        setActiveChords(activeChordsCopy);
    }

    return(
        <Card variant="outlined">
          <Grid container>
            <Grid item xs={2}>
                <Button ref={chordMenuRef} onClick={() => setChordMenuOpen(true)}>
                    add chord
                </Button>
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
            <Grid item xs={9} ref={widthRef}>
                <Box display="flex" flexDirection="row" height="100px">
                    {chordsOrder.map((id) => {
                        const currData = activeChords.get(id);
                        if (!currData) return null;
                        return <ChordView
                            chordName={currData.name}
                            id={currData.id}
                            width={widthRef.current ? widthRef.current.offsetWidth * (currData.duration / currEndTime) : 0}
                            duration={currData.duration}
                            onStop={onChordMoved}
                            position={widthRef.current ? widthRef.current.offsetWidth * (currData.startTime / currEndTime) : 0}
                            startTime={currData.startTime}
                            wholeTrackWidth={widthRef.current ? widthRef.current.offsetWidth : 0}
                        />
                    })}
                </Box>
            </Grid>
          </Grid>
      </Card>
    );
}

export default SynthTrack;