import { Button, Card, CardActions, CardContent, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import * as Pizzicato from 'pizzicato';
import * as Tone from 'tone';

// type Props = {
//     name: string;
//     image: any;
//     description: string;
//     author: string;
// };

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
  
const ProjectCard: React.FC = () => {
    const classes = useStyles();
    // console.log(window.location.pathname);
    // const file = URL.createObjectURL("file:///C:/Users/noale/Desktop/music%20hub%20project/my-app/music_files/15steps.mp3");
    // "file:///C:/Users/noale/Desktop/music%20hub%20project/my-app/src/example.ogg"
    // "C:\\Users\\noale\\Desktop\\music hub project\\my-app\\src\\example.ogg"
    const sound = new Pizzicato.Sound({ 
        source: 'file',
        options: { path: "http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3" }
    }, function(e: any) {
        if (!e) {
            console.log('sound file loaded!');
        }
        console.log('error is: ' + e);
    });
    const player = new Tone.Player("http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3").toDestination();

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
                <div className={classes.controls}>
                    <IconButton aria-label="previous">
                        <SkipPreviousIcon />
                    </IconButton>
                    <IconButton aria-label="play/pause" onClick={() => player.start()}>
                        <PlayArrowIcon className={classes.playIcon} />
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