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
}

type EffectsData = {
  reverb: EffectNode;
  distortion: EffectNode;
  tremolo: EffectNode;
}

type RTData = {
  player: PeaksPlayer;
  effects: EffectsData;
  url: string | undefined;
}

type UTData = {
  player: PeaksPlayer;
}

type SynthData = {
  chords: ChordData[];
  order: number[];
}

type ProjectJson = {
  recordedUrls: string[];
  synthTracks: SynthData[];
  length: number;
}

type ActionsJson = {
  projectId: string;
  trackType: string;
  trackId: number;
  newTrack: boolean;
  blob?: Blob;
  effect?: string;
  sliceFrom?: number;
  sliceTo?: number;
  chordsOrder?: number[];
  chords?: {
    id: number;
    data: ChordData;
  }[];
}

export type {ChordData, STData, RTData, UTData, ActionsJson, ProjectJson, SynthData, EffectsData};