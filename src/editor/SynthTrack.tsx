import { useEffect, useRef, useState } from "react";
import * as Tone from 'tone';
import { Button, Card, Select, Grid, MenuItem, TextField, Popover, Box } from '@material-ui/core';

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
    ['D', ['D4', 'F#4', 'A4']],
    ['Dm', ['D4', 'F4', 'A4']],
    ['E', ['E4', 'G#4', 'B4']],
    ['Em', ['E4', 'G4', 'B4']],
    ['F', ['F4', 'A4', 'C4']],
    ['Fm', ['F4', 'G#4', 'C4']],
    ['G', ['G4', 'B4', 'D4']],
    ['Gm', ['B4', 'A#4', 'D4']]
]);
  
const SynthTrack: React.FC = () => {
    const [synth, setSynth] = useState<Tone.PolySynth>(new Tone.PolySynth().toDestination());
    const [chord, setChord] = useState<string>("A");
    const [duration, setDuration] = useState<string>("0");
    const [currEndTime, setCurrEndTime] = useState<number>(0);
    const [chordMenuOpen, setChordMenuOpen] = useState<boolean>(false);
    const chordMenuRef = useRef(null);

    useEffect(() => {
        synth.sync();
    }, [synth]);

    const addChord = () => {
        const notes = chordToNotes.get(chord);
        if (!notes) {
            console.log("chord wasn't found");
            return;
        }
        
        synth.triggerAttackRelease(notes, duration, currEndTime);
        setCurrEndTime(currEndTime + Tone.Time(duration).toSeconds());
        setChordMenuOpen(false);
    }

    const handleChordChange = (e: any) => {
        setChord(e.target.value);
    }

    const handleDurationChange = (e: any) => {
        setDuration(e.target.value);
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
                                return <MenuItem id={index.toString()} value={item}>{item}</MenuItem>
                            })}
                        </Select>
                        <TextField label="Duration" value={duration} onChange={handleDurationChange}/>
                        <Button onClick={addChord}>Apply</Button>
                    </Box>  
                </Popover>
            </Grid>
            <Grid item xs={9}>
                I am  synth track
            </Grid>
          </Grid>
      </Card>
    );
}

export default SynthTrack;