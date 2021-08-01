import * as Tone from 'tone';
import {PeaksPlayer} from "../ToneComponents";

type ChordData = {
  id: number;
  name: string;
  duration: number;
  durationStr: string;
  startTime: number;
}

type STData = {
  synth: Tone.PolySynth;
  activeChords: Map<number,ChordData>;
  chordsOrder: number[];
  length: number;
}

type EffectNode = {
  on: boolean;
  node: Tone.ToneAudioNode | undefined;
  level?: number;
}

type EffectsData = {
  reverb: EffectNode;
  distortion: EffectNode;
  tremolo: EffectNode;
}

type AudioTrackData = {
  type: string;
  player: PeaksPlayer;
  effects: EffectsData;
  url: string | undefined;
  file: Blob | undefined;
  slices: number[][];
  trackInfo: TrackInfo | undefined;
}

// type UTData = {
//   player: PeaksPlayer;
//   effects: EffectsData;
//   url?: string;
//   file: Blob | undefined;
//   slices: number[][];
//   trackInfo: TrackInfo | undefined;
// }

type SynthData = {
  activeChords: ChordData[];
  chordsOrder: number[];
  length: number;
}

type ProjectUrls = {
  recorded: {
    url: string;
    id: string;
  }[];
  uploaded: {
    url: string;
    id: string;
  }[];
  json: string[];
}

type TrackInfo = {
  trackId: string;
  trackType: string;
  reverb?: number;
  distortion?: number;
  tremolo?: number;
  slices: number[][];
}

type ProjectData = {
  synthTracks: {id: string, data: STData}[];
  audioTracks: TrackInfo[];
}

export type {ChordData, STData, AudioTrackData, ProjectUrls, ProjectData, SynthData, EffectsData, TrackInfo};