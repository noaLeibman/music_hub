import { RefObject } from 'react';
import * as Tone from 'tone';
import { ToneAudioNode } from 'tone';
import WaveSurfer from "wavesurfer.js";
import Peaks, { PeaksInstance } from 'peaks.js'

async function startTone() {
  await Tone.start();
}

// class Player {
//   player: Tone.Player;

//   constructor() {
//     this.player = new Tone.Player().toDestination();
//     this.player.sync().start(0);
//   }

//   get() {
//     return this.player;
//   }

//   start() {
//     Tone.Transport.start();
//   }

//   restart() {
//     Tone.Transport.stop();
//     Tone.Transport.start();
//   }

//   pause() {
//     Tone.Transport.pause();
//   }

//   stop() {
//     Tone.Transport.stop();
//   }

//   async load(url: string) {
//     await this.player.load(url);
//   }
// }

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

  // clampToCurrentTime(time: any) {
  //   if (this._synced) {
  //       return time;
  //   }
  //   else {
  //       return Math.max(time, this.context.currentTime);
  //   }
  // }

  load(url: string) {
    this.waveSurfer.load(url);
    return new Promise<this>(() => {});
  }

  // start(time?: Time, offset?: Time, duration?: Time) {
  //   let computedTime = !time && this._synced ? this.context.transport.seconds : this.toSeconds(time);
  //   computedTime = this.clampToCurrentTime(computedTime);
  //   this.context.transport.schedule(t => {
  //     this.waveSurfer.play();
  //   }, computedTime);
  //   return this;
  // }

  play() {
    Tone.Transport.start();
  }

  pause() {
    Tone.Transport.pause();
  }

  stop_() {
    Tone.Transport.stop();
  }

  // stop(time?: Time | undefined) {
  //   this.waveSurfer.stop();
  //   return this;
  // }

  getWavesurfer() {
    return this.waveSurfer;
  }
}

class WaveSurferNode extends ToneAudioNode {
  name: string;
  input: Tone.InputNode | undefined;
  output: Tone.OutputNode | undefined;
  waveSurfer: WaveSurfer;
  
  constructor(ref: any) {
    super();
    this.name = "WaveSurferNode";
    this.input = undefined;
    this.output = Tone.Destination;
    this.waveSurfer = WaveSurfer.create({
      container: ref,
      waveColor: 'violet',
      progressColor: 'purple',
      responsive: true,
      normalize: true,
      partialRender: true
    });
  }

  load(url: string) {
    this.waveSurfer.load(url);
  }

  sync() {
    this.context.transport.on("start", () => {this.waveSurfer.play()});
    this.context.transport.on("stop", () => {this.waveSurfer.stop()});
    this.context.transport.on("pause", () => {this.waveSurfer.pause()});
    return this;
  }

  play() {
    Tone.Transport.start();
  }

  pause() {
    Tone.Transport.pause();
  }

  stop() {
    Tone.Transport.stop();
  }
}

type PeaksPlayerProps = {
  zoomRef: RefObject<unknown>;
  overviewRef: RefObject<unknown>;
};

class PeaksPlayer {
  zoomRef: any;
  overviewRef: any;
  peaks: PeaksInstance | undefined;
  player: Player | undefined; 

  constructor(props: PeaksPlayerProps) {
    this.zoomRef = props.zoomRef;
    this.overviewRef = props.overviewRef;
    this.peaks = undefined;
    this.player = undefined;
  }

  async load(url: string) {
    if (!this.player) {
      this.player = new Player();
      await this.player.externalPlayer.load(url);
    } else {
      await this.player.externalPlayer.load(url);
    }
    if (this.peaks) {
      this.peaks.destroy();
    }
    const options = {
      containers: {
        overview: this.overviewRef.current,
        zoomview: this.zoomRef.current
      },
      player: this.player,
      webAudio: {
        audioBuffer: this.player.externalPlayer.buffer.get(),
        scale: 128,
        multiChannel: false
      },
      keyboard: true,
      showPlayheadTime: true,
      zoomLevels: [128, 256, 512, 1024, 2048, 4096]
    };
    Peaks.init(options, (err, peaks) => {
      if (err) {
        console.log(err.message);
      } else {
        this.peaks = peaks;
        console.log('peaks initialized');
      }
    });
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
}

class Player {
  externalPlayer: Tone.Player;
  eventEmitter: any;

  constructor() {
    this.externalPlayer = new Tone.Player().toDestination();
  }

  init(eventEmitter: any) {
    this.eventEmitter = eventEmitter;
    this.externalPlayer.sync();
    this.externalPlayer.start();

    eventEmitter.emit('player.canplay');
    Tone.Transport.scheduleRepeat(() => {
      var time = this.getCurrentTime();
      eventEmitter.emit('player.timeupdate', time);

      if (time >= this.getDuration()) {
        Tone.Transport.stop();
      }
    }, 0.25);
  }

  destroy() {
    Tone.context.dispose();
  }

  play() {
    Tone.Transport.start();
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
    return this.externalPlayer.buffer.get();
  }
};


export {PeaksPlayer, Player, UserMedia, Recorder, startTone, Effects, WaveformPlayer, WaveSurferNode};