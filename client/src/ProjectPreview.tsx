import { Card, CardContent, CardMedia, Grid, IconButton, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import defaultImg from './images/blackWave.png';

type ProjectProps = {
    image_url?: string;
    project_name: string;
    author: string;
    description: string;
    project_id: string;
    viewInEditor: (id: string, name: string) => void;
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        marginLeft: '25%',
        marginRight: '25%',
        boxShadow: '0 3px 5px 2px #a7abb0',
        padding: '10px',
        border: 1,
        maxWidth: '500px',
    },
    pos: {
      marginBottom: 12,
    },
    controls: {
        alignItems: 'center',
        width: 'flex',
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
        flexDirection: 'row',
        alignItems: 'center',
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
    customWidth: {
        maxWidth: 100,
        fontSize: 14,
    },
  });
  
const ProjectCard: React.FC<ProjectProps> = (props) => {
    const classes = useStyles();

    return (
        <div>
            <Card className={classes.root}>
                <CardMedia
                    className={classes.cover}
                    image={props.image_url  ? props.image_url : defaultImg}
                />
                <Grid container className={classes.details}>
                    <Grid item xs={6}>
                        <CardContent className={classes.content}>
                            <Typography component="h5" variant="h5" align='left'>
                                <strong>{props.project_name}</strong>
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary" align='left'>
                                {props.author}
                            </Typography>
                            <Typography variant="body2" component="p" align='left'>
                                {props.description}
                            </Typography>
                        </CardContent>
                    </Grid>
                    <Grid item xs={6} className={classes.controls}>
                        <Tooltip
                            classes={{ tooltip: classes.customWidth }}
                            title="View in editor.
                            (Viewing only. To edit your own project, go to 'My Profile')"
                            placement="left"
                        >
                            <IconButton edge="end" onClick={() => props.viewInEditor(props.project_id, props.project_name)}>
                                <PlayArrowIcon className={classes.playIcon} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

export { ProjectCard };
export type { ProjectProps };
