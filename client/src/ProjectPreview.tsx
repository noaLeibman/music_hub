import { Button, Card, CardActions, CardContent, CardMedia, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useRef, useState } from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { PeaksInstance } from 'peaks.js'

type ProjectProps = {

    image_url?: string;
    project_name: string;
    author: string;
    description: string;
    peaks?: PeaksInstance;

}

const useStyles = makeStyles({
    root: {
        display: 'flex',
    },
    // root: {
    //     display: 'block',
    //     width: '50%',
    //     marginLeft: '25%',
    //     marginRight: '25%',
    //     marginTop: '5%',
    //     marginBottom: '5%',
    //     backgroundColor: '#e8edea',
    // },
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
    details: {
        display: 'flex',
        flexDirection: 'column',
    },  
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: 151,
    },  
  });
  
const ProjectCard: React.FC<ProjectProps> = (props) => {
    const classes = useStyles();
    const [playing, setPlaying] = useState<boolean>(false);
    // const [loaded, setLoaded] = useState<boolean>(false);
    const waveformRef = useRef(null);
    // const dummyRef = useRef(null);

    const onClickPlay = () => {
        if (playing) {
            props.peaks?.player.pause();
            setPlaying(false);
        } else {
            props.peaks?.player.play();
            setPlaying(true);
        }
    }

    return (
        <div>
            <Card className={classes.root}>
            <div className={classes.details}>
                <CardContent className={classes.content}>
                <Typography component="h5" variant="h5">
                    Live From Space
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Mac Miller
                </Typography>
                </CardContent>
                <div className={classes.controls}>
                    <IconButton aria-label="play/pause">
                        <PlayArrowIcon className={classes.playIcon} />
                    </IconButton>
                </div>
            </div>
            <CardMedia
                className={classes.cover}
                image="/static/images/cards/live-from-space.jpg"
                title="Live from space album cover"
            />
        </Card>


            {/* <Card className={classes.root} variant="outlined">
                <CardContent>
                    <Typography variant="h5" component="h2">
                    {props.project_name}
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                    {props.author}
                    </Typography>
                    <Typography variant="body2" component="p">
                    {props.description}
                    </Typography>
                </CardContent>
                <div ref={waveformRef}/>
                <div className={classes.controls}>
                    <IconButton aria-label="play/pause" onClick={onClickPlay}>
                       { playing ? <PauseIcon className={classes.playIcon} />: <PlayArrowIcon className={classes.playIcon} />}
                    </IconButton>
                </div>
                <CardActions className={classes.cardButton} >
                    <Button size="small" variant="contained" color="primary">Learn More</Button>
                </CardActions>
            </Card> */}
        </div>
    );
};

export { ProjectCard };
export type { ProjectProps };
