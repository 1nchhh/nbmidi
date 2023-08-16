declare module 'midi-parser-js' {
    export type MIDIEvent = {
        deltaTime: number;
        type: 255;
        metaType?: number;
        channel?: number;
        data?: string;
    } | {
        deltaTime: number;
        type: number;
        metaType?: number;
        channel?: number;
        data?: number[];
    };

    export type Track = {
        event: MIDIEvent[];
    }

    export type Midi = {
        formatType: number;
        tracks: number;
        timeDivision: number;
        track: Track[];
    };

    export let debug: boolean;

    export function parse(buffer: Uint8Array | string | (HTMLElement & { type: 'file' })): Midi;
    export function parse(buffer: Uint8Array | string | (HTMLElement & { type: 'file' }), callback: (midi: Midi) => void): void;

    export function addListener(event: string, callback: (midi: Midi) => void): void;

    export function Base64(input: string): Midi;

    export function Uint8(input: Uint8Array): Midi;

    export let customInterpreter: (e_type: number, arrayBuffer: Uint8Array, metaEventLength: number) => number;
}
