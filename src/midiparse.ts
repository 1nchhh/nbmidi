import Midi from 'midi-parser-js';
import { MidiNoteMapping } from './notemapping';

export type Note = {
    note: number;
    time: number;
    duration: number;
    velocity: number;
};

export enum MidiEventType {
    Start = 0xFF,
    KeyOn = 0x09,
    KeyOff = 0x08,
    CtrlChange = 0x0B,
    ProgChange = 0x0C,
    PitchBend = 0x0E,
}

export default function parseMidi(raw: Buffer): { [channel: number]: (Note & { noteName: keyof typeof MidiNoteMapping })[] } {
    const midi = Midi.parse(raw);

    const notes: { [channel: number]: { [key: string]: Note[] } } = {};

    for (const track of midi.track) {
        let time = 0;

        for (const event of track.event) {
            time += event.deltaTime;

            if (event.type === MidiEventType.KeyOn) {
                const note = event.data[0];
                const velocity = event.data[1];

                if (velocity > 0) {
                    if (!notes[event.channel]) {
                        notes[event.channel] = {};
                    }

                    if (!notes[event.channel][note]) {
                        notes[event.channel][note] = [];
                    }

                    notes[event.channel][note].push({
                        note,
                        time,
                        duration: 0,
                        velocity
                    });
                } else {
                    const noteObj = notes[event.channel][note][notes[event.channel][note].length - 1];

                    if (noteObj) {
                        noteObj.duration = time - noteObj.time;
                    }
                }
            } else if (event.type === MidiEventType.KeyOff) {
                const note = event.data[0];

                const noteObj = notes[event.channel][note][notes[event.channel][note].length - 1];

                if (noteObj) {
                    noteObj.duration = time - noteObj.time;
                }
            }
        }
    }

    return Object.keys(notes).reduce((acc, channel) => {
        acc[parseInt(channel)] = Object.keys(notes[parseInt(channel)]).reduce((acc, note) => {
            acc.push(...notes[parseInt(channel)][parseInt(note)].map(note => ({
                ...note,
                noteName: MidiNoteMapping[note.note]
            } as Note & { noteName: keyof typeof MidiNoteMapping })));

            return acc;
        }, [] as (Note & { noteName: keyof typeof MidiNoteMapping })[]) as (Note & { noteName: keyof typeof MidiNoteMapping })[];

        // sort notes by time
        acc[parseInt(channel)].sort((a, b) => a.time - b.time);

        return acc;
    }, {} as { [channel: number]: (Note & { noteName: keyof typeof MidiNoteMapping })[] });
}
