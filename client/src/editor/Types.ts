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
  file: Blob | undefined;
}

type UTData = {
  player: PeaksPlayer;
  url?: string;
  file: Blob | undefined;
}

type SynthData = {
  activeChords: ChordData[];
  chordsOrder: number[];
  length: number;
}

type ProjectJson = {
  recorded: string[];
  uploaded: string[];
  json: string[];
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