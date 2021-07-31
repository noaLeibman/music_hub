import * as Tone from 'tone';
import Peaks, { PeaksInstance } from 'peaks.js'

async function startTone() {
  await Tone.start();
}

class UserMedia {
  userMedia: Tone.UserMedia;

  constructor() {
    this.userMedia = new Tone.UserMedia()
  }

  async open() {
    try {
      await this.userMedia.open();
    } catch (err) {
      console.log('Error in userMedia.open()' + err);
    }
  }

  connect(recorder: Recorder) {
    this.userMedia.connect(recorder.get());
  }

  close() {
    this.userMedia.close();
  }
}

class Recorder {
  recorder: Tone.Recorder;

  constructor() {
    this.recorder = new Tone.Recorder();
  }

  get() {
    return this.recorder;
  }
}

class Effects {
  static getReverb(delay: number) {
    return new Tone.Reverb(delay).toDestination();
  }

  static getDistortion(level: number) {
    return new Tone.Distortion(level).toDestination();
  }

  static getTremolo(level: number) {
    return new Tone.Tremolo(level, 0.9).toDestination().start();
  }
}

class PeaksPlayer {
  zoomRef: any;
  overviewRef: any;
  peaks: PeaksInstance | undefined;
  player: Player | undefined;
  options: any;
  loaded: boolean;

  constructor() {
    // this.zoomRef = props.zoomRef;
    // this.overviewRef = props.overviewRef;
    this.zoomRef = undefined;
    this.overviewRef = undefined;
    this.peaks = undefined;
    this.player = undefined;
    this.loaded = false;
  }

  async load(url: string, newZoomRef: any, newOverviewRef: any) {
    console.log('load start');
    if (!this.player) {
      this.player = new Player();
      await this.player.externalPlayer.load(url);
    } else {
      await this.player.externalPlayer.load(url);
    }
    if (this.peaks) {
      this.peaks.destroy();
    }
    this.overviewRef = newOverviewRef;
    this.zoomRef = newZoomRef;
    const options = {
      containers: {
        overview: this.overviewRef.current,
        zoomview: this.zoomRef.current
      },
      player: this.player,
      webAudio: {
        audioBuffer: this.player.externalPlayer.buffer.get(),
        multiChannel: false
      },
      keyboard: true,
      showPlayheadTime: true,
    };
    this.options = options;
    if (!this.peaks) {
      Peaks.init(options, (err, peaks) => {
        if (err) {
          console.log(err.message);
        } else {
          this.peaks = peaks;
          console.log('peaks initialized');
          this.loaded = true;
        }
      });
    } else {
      this.peaks.setSource({webAudio: {audioBuffer: this.player.externalPlayer.buffer.get()}}, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('peaks.setSource succeeded');
        }
      });
    }
    
  }

  connect(node: Tone.ToneAudioNode) {
    try {
      this.player?.externalPlayer.connect(node);
    } catch (e) {
      console.log('in PeaksPlayer.connect: ' + e);
    }
  }

  disconnect(node: Tone.ToneAudioNode) {
    console.log(this.player?.externalPlayer.context === node.context);
    try {
      this.player?.externalPlayer.disconnect(node);
    } catch (e) {
      console.log('in PeaksPlayer.disconnect: ' + e);
    }
  }

  play() {
    this.peaks?.player.play();
  }

  pause() {
    this.peaks?.player.pause();
  }

  stop() {
    this.peaks?.player.pause();
    this.peaks?.player.seek(0);
  }

  setPeaksBuffer(buffer: AudioBuffer) {
    this.options.webAudio.audioBuffer = buffer;
    this.peaks?.setSource(this.options, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Peaks setSource finished');
      }
    });
  }

  dispose() {
    this.player?.externalPlayer.dispose();
  }
}

class Player {
  externalPlayer: Tone.Player;
  eventEmitter: any;

  constructor() {
    this.externalPlayer = new Tone.Player().toDestination();
    this.externalPlayer.onstop = () => {
      this.eventEmitter.emit('player.pause', this.getCurrentTime());
      // this.eventEmitter.emit('player.seeked', 0);
      // this.eventEmitter.emit('player.timeupdate', this.getCurrentTime());
    }
  }

  init(eventEmitter: any) {
    this.eventEmitter = eventEmitter;
    this.externalPlayer.sync().start(0);

    eventEmitter.emit('player.canplay');
    // console.log(eventEmitter);
    Tone.Transport.schedule(() => {
      this.play();
    }, 0);
    // Tone.Transport.on('stop', () => {
    //   this.seek(0);
    // })
  }

  destroy() {
    Tone.context.dispose();
  }

  play() {
    //Tone.Transport.start();
    this.eventEmitter.emit('player.play', this.getCurrentTime());
    return new Promise<void>((resolve) => {});
  }

  pause() {
    Tone.Transport.pause();
    this.eventEmitter.emit('player.pause', this.getCurrentTime());
  }

  isPlaying() {
    return Tone.Transport.state === "started";
  }

  seek(time: number) {
    Tone.Transport.seconds = time;
    this.eventEmitter.emit('player.seeked', this.getCurrentTime());
    this.eventEmitter.emit('player.timeupdate', this.getCurrentTime());
  }

  isSeeking() {
    return false;
  }

  getCurrentTime() {
    return Tone.Time(Tone.Transport.position).toSeconds();
  }

  getDuration() {
    return this.externalPlayer.buffer.duration;
  }

  getBuffer() {
    return this.externalPlayer.buffer;
  }
};


export {PeaksPlayer, Player, UserMedia, Recorder, startTone, Effects};