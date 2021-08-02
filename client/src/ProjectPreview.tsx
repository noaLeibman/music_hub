import { Button, Card, CardActions, CardContent, CardMedia, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useRef, useState } from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { PeaksInstance } from 'peaks.js';
import defaultImg from './images/projDefault.jpg';

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
        marginLeft: '25%',
        marginRight: '25%',
        marginTop: '5%',
        marginBottom: '5%',
        boxShadow: '0 3px 5px 2px #a7abb0',
        padding: '10px',
        border: 1,
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
        marginLeft: '30px',
    },
    cover: {
        borderColor: 'black',
        border: 1,
        width: 151,
    },  
  });
  
const ProjectCard: React.FC<ProjectProps> = (props) => {
    const classes = useStyles();
    const [playing, setPlaying] = useState<boolean>(false);
    // const [loaded, setLoaded] = useState<boolean>(false);
    // const waveformRef = useRef(null);

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
                <CardMedia
                    className={classes.cover}
                    image={props.image_url === "" ? props.image_url : defaultImg}
                />
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                    <Typography component="h5" variant="h5">
                        <strong>{props.project_name}</strong>
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {props.author}
                    </Typography>
                    <Typography variant="body2" component="p">
                        {props.description}
                    </Typography>
                    </CardContent>
                    <div className={classes.controls}>
                        <IconButton aria-label="play/pause">
                            <PlayArrowIcon className={classes.playIcon} />
                        </IconButton>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export { ProjectCard };
export type { ProjectProps };
