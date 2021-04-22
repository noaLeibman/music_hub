import { Button, Card, CardActions, CardContent, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useRef, useState } from 'react';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { WaveformPlayer } from './ToneComponents';

type Props = {
    player: WaveformPlayer | undefined;
    url: string;
}

const useStyles = makeStyles({
    root: {
        display: 'block',
        width: '50%',
        marginLeft: '25%',
        marginRight: '25%',
        marginTop: '5%',
        marginBottom: '5%',
        backgroundColor: '#FBF9E1',
    },
    pos: {
      marginBottom: 12,
    },
    controls: {
        alignItems: 'center',
    },
    playIcon: {
        height: 38,
        width: 38,
    },
    cardButton: {
        justifyContent: 'center'
    },
  });
  
const ProjectCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const [playing, setPlaying] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const waveformRef = useRef(null);

    // useEffect(() => {
    //     if (props.player) {
    //         props.player.init(waveformRef.current);
    //         props.player.sync().start(0);
    //     }
    // },[props.player])

    const onClickPlay = async () => {
        if (!props.player) return;
        if (!props.player.getWavesurfer()) {
            props.player.init(waveformRef.current);
            props.player.sync();
        }
        if (playing) {
            props.player.pause()
            setPlaying(false);
        } else {
            if (!loaded) {
                props.player.getWavesurfer().on("ready", function() {
                    props.player?.play();
                    console.log('on ready');
                    setPlaying(true);
                    setLoaded(true);
                })
                await props.player.load(props.url);
            } else {
                props.player.play();
                setPlaying(true);
            }
        }
    }

    return (
        <div>
            <Card className={classes.root} >
                <CardContent>
                    <Typography variant="h5" component="h2">
                    Project name
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                    Author name
                    </Typography>
                    <Typography variant="body2" component="p">
                    Description, bla bla bla.
                    </Typography>
                </CardContent>
                {/* {player && <Waveform
                    color='black'
                    height={100}
                    width={500}
                    buffer={player?.buffer.get()}
                />} */}
                <div ref={waveformRef}/>
                <div className={classes.controls}>
                    <IconButton aria-label="previous">
                        <SkipPreviousIcon />
                    </IconButton>
                    <IconButton aria-label="play/pause" onClick={onClickPlay}>
                       { playing ? <PauseIcon className={classes.playIcon} />: <PlayArrowIcon className={classes.playIcon} />}
                    </IconButton>
                    <IconButton aria-label="next">
                    <SkipNextIcon />
                    </IconButton>
                </div>
                <CardActions className={classes.cardButton} >
                    <Button size="small" variant="contained" color="primary">Learn More</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default ProjectCard;