import { Button, Box, TextField, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import * as Tone from 'tone';

const useStyles = makeStyles({
    root: {
        boxShadow: '0 3px 5px 2px #a7abb0',
        width: '120px',
        padding: '10px',
        border: 1,
        marginLeft: '10px',
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    button: {
        margin: '5px'
    },
  });

type Props = {
    viewOnly: boolean;
}

const Metronome: React.FC<Props> = (props) => {
    const [bpm, setBpm] = useState<number>(120);
    const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
    const [loop, setLoop] = useState<Tone.Loop>();
    const [sampler, setSampler] = useState<Tone.Sampler>();
    const [mute, setMute] = useState<boolean>(false);

    const classes = useStyles();

    const handleBpmChange = (e: any) => {
        setBpm(e.target.value);
    }

    useEffect(() => {
        const newSampler = new Tone.Sampler({
            urls: {
                A1: "268822__kwahmah-02__woodblock.wav",
                A2: "50070__m1rk0__metronom-klack.wav",
            },
            baseUrl: "https://music-hub-public-164582924dbjh.s3.eu-central-1.amazonaws.com/",
            onload: () => {}
        }).toDestination();
        setSampler(newSampler);
    }, []);

    const updateMetronome = () => {
        if (!sampler) return;
        if (loop) {
            loop.dispose();
        }
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.timeSignature = beatsPerBar;
        setLoop(new Tone.Loop(() => {
            sampler.triggerAttack('A1');
            for (let i = 1; i < beatsPerBar; i++) {
                sampler.triggerAttack('A2', '+0:' + String(i));
            }
        }, '1m').start(0));
    }

    const clickMute = () => {
        if (loop) {
            loop.mute = !loop.mute;
            setMute(loop.mute);
        }
    }

    return (
        <Box className={classes.root}>
            <TextField label="BPM:" value={bpm} onChange={handleBpmChange}/>
            <TextField label="Beats per bar:" value={beatsPerBar} onChange={(e) => setBeatsPerBar(Number(e.target.value))}/>
            <Button disabled={props.viewOnly} className={classes.button} onClick={updateMetronome} color='secondary' variant='contained' size='small'>apply</Button>
            <Button disabled={props.viewOnly} className={classes.button} onClick={clickMute} color='secondary' variant='contained' size='small'>
                {mute ? 'unmute' : 'mute'}
            </Button>
        </Box>
    )
}

export default Metronome;