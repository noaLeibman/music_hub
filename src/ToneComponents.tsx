import * as Tone from 'tone';
import WaveSurfer from "wavesurfer.js";
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

  static getDistortion() {
    return new Tone.Distortion(0.8).toDestination();
  }
}

class WaveformPlayer extends Tone.Player {
  waveSurfer!: WaveSurfer;

  init(ref: any) {
    this.waveSurfer = WaveSurfer.create({
      container: ref,
      waveColor: 'violet',
      progressColor: 'purple',
      responsive: true,
      partialRender: true
    });
  }

  sync() {
    this.context.transport.on("start", () => {this.waveSurfer.play()});
    this.context.transport.on("stop", () => {this.waveSurfer.stop()});
    this.context.transport.on("pause", () => {this.waveSurfer.pause()});
    return this;
  }

  load(url: string) {
    this.waveSurfer.load(url);
    return new Promise<this>(() => {});
  }

  play() {
    Tone.Transport.start();
  }

  pause() {
    Tone.Transport.pause();
  }

  stop_() {
    Tone.Transport.stop();
  }

  getWavesurfer() {
    return this.waveSurfer;
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

  connect(node: any) {
    this.player?.externalPlayer.connect(node);
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
    console.log(eventEmitter);
    Tone.Transport.schedule(() => {
      this.play();
    }, 0);
    Tone.Transport.on('stop', () => {
      this.seek(0);
    })
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


export {PeaksPlayer, Player, UserMedia, Recorder, startTone, Effects, WaveformPlayer};