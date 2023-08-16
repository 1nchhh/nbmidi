import parseMidi from './midiparse';
import NoteBlock from './noteblock';
import Repeater from './repeater';
import { MIDINoteMcMapping } from './notemapping';
import { NoteInstrument } from './noteblock';

export default class MIDINoteBlockParser {
    octaveShift: number;
    instrument: NoteInstrument;

    constructor(octaveShift = 0, instrument: NoteInstrument = 'harp') {
        this.octaveShift = octaveShift;
        this.instrument = instrument;
    }

    parse(midi: Buffer): (NoteBlock | Repeater)[] {
        const notes = parseMidi(midi);

        const blocks: (NoteBlock | Repeater)[] = [];

        const channelNotes = notes[0].filter(({ note }) => MIDINoteMcMapping[note] !== undefined);

        let time = 0;

        const firstNote = channelNotes.shift();

        const noteBlock = new NoteBlock([
            {
                note: MIDINoteMcMapping[MIDINoteMcMapping[firstNote.note] as keyof typeof MIDINoteMcMapping] + this.octaveShift * 12,
                instrument: this.instrument
            }
        ]);

        blocks.push(noteBlock);

        time = firstNote.time;

        for (const note of channelNotes) {
            /*
               24 duration = 1 tick

               ticks = starting time - next note time
            */
            const ticks = (note.time - time) / 24;

            const repeater = new Repeater(ticks, false, false, 'east');

            blocks.push(repeater);

            const noteBlock = new NoteBlock([
                {
                    note: MIDINoteMcMapping[MIDINoteMcMapping[note.note] as keyof typeof MIDINoteMcMapping] + this.octaveShift * 12,
                    instrument: this.instrument
                }
            ]);

            blocks.push(noteBlock);

            time = note.time;
        }

        return blocks;
    }
}
