import { NBTTag, NBTJson } from './nbt';

export type NoteInstrument =
    'harp' |
    'bass' |
    'basedrum' |
    'snare' |
    'hat' |
    'guitar' |
    'flute' |
    'bell' |
    'chime' |
    'xylophone' |
    'iron_xylophone' |
    'cow_bell' |
    'didgeridoo' |
    'bit' |
    'banjo' |
    'pling';

const blocks: {
    [key: string]: NBTTag[];
} = Object.entries({
    harp: 'minecraft:grass_block',
    bass: 'minecraft:oak_planks',
    basedrum: 'minecraft:stone',
    snare: 'minecraft:sand',
    hat: 'minecraft:glass',
    guitar: 'minecraft:white_wool',
    flute: 'minecraft:clay',
    bell: 'minecraft:gold_block',
    chime: 'minecraft:packed_ice',
    xylophone: 'minecraft:bone_block',
    iron_xylophone: 'minecraft:iron_block',
    cow_bell: 'minecraft:soul_sand',
    didgeridoo: 'minecraft:pumpkin',
    bit: 'minecraft:emerald_block',
    banjo: 'minecraft:hay_block',
    pling: 'minecraft:glowstone'
}).reduce((acc, [key, value]) => {
    acc[key] = [
        {
            tagType: 8,
            name: 'Name',
            value
        }
    ];
    return acc;
}, {} as {
    [key: string]: NBTTag[];
});

export default class NoteBlock {
    notes: { note: number, instrument: NoteInstrument }[];

    data: NBTJson;

    static INSTRUMENTS: { [key: string]: NoteInstrument } = {
        harp: 'harp',
        bass: 'bass',
        basedrum: 'basedrum',
        snare: 'snare',
        hat: 'hat',
        guitar: 'guitar',
        flute: 'flute',
        bell: 'bell',
        chime: 'chime',
        xylophone: 'xylophone',
        iron_xylophone: 'iron_xylophone',
        cow_bell: 'cow_bell',
        didgeridoo: 'didgeridoo',
        bit: 'bit',
        banjo: 'banjo',
        pling: 'pling'
    };
    static MAX_PITCH = 24;
    static positions = [
        [
            [0, 0, 1]
        ],
        [
            [0, 0, 0],
            [0, 0, 1]
        ],
        [
            [0, 0, 0],
            [0, 0, 1],
            [0, 0, 2]
        ]
    ];

    constructor(notes: { note: number, instrument: NoteInstrument }[]) {
        this.notes = notes;

        if (notes.length > 3) {
            throw new Error('Too many notes');
        }

        const blockList = [...new Set([
            // blocks[this.instrument],
            ...notes.map(({ instrument }) => blocks[instrument]),
            ...this.notes.map(({ note, instrument }) => [
                {
                    tagType: 10,
                    name: 'Properties',
                    value: [
                        {
                            tagType: 8,
                            name: 'note',
                            value: note.toString()
                        },
                        {
                            tagType: 8,
                            name: 'powered',
                            value: 'false'
                        },
                        {
                            tagType: 8,
                            name: 'instrument',
                            value: instrument
                        }
                    ]
                },
                {
                    tagType: 8,
                    name: 'Name',
                    value: 'minecraft:note_block'
                }
            ])
        ])];

        this.data = {
            name: `NoteBlocks (${notes.length})`,
            version: '0.4.0',
            nbt2JsonUrl: 'https://github.com/midnightfreddie/nbt2json',
            conversionTime: new Date().toISOString(),
            nbt: [
                {
                    tagType: 10,
                    name: '',
                    value: [
                        {
                            tagType: 9,
                            name: 'size',
                            value: {
                                tagListType: 3,
                                list: [
                                    1,
                                    2,
                                    3
                                ]
                            }
                        },
                        {
                            tagType: 9,
                            name: 'entities',
                            value: {
                                tagListType: 0,
                                list: null
                            }
                        },
                        {
                            tagType: 9,
                            name: 'blocks',
                            value: {
                                tagListType: 10,
                                list: [
                                    ...this.notes.map(({ instrument }, i) => [
                                        {
                                            tagType: 9,
                                            name: 'pos',
                                            value: {
                                                tagListType: 3,
                                                list: NoteBlock.positions[notes.length - 1][i]
                                            }
                                        },
                                        {
                                            tagType: 3,
                                            name: 'state',
                                            value: blockList.indexOf(blocks[instrument])
                                        }
                                    ]),
                                    ...this.notes.map(({ note, instrument }, i) => {
                                        const d = [
                                            {
                                                tagType: 9,
                                                name: 'pos',
                                                value: {
                                                    tagListType: 3,
                                                    list: [...NoteBlock.positions[notes.length - 1][i]]
                                                }
                                            },
                                            {
                                                tagType: 3,
                                                name: 'state',
                                                value: blockList.findIndex((block) => {
                                                    return ((block[0].value as NBTTag[])[0].value === note.toString() && (block[0].value as NBTTag[])[2].value === instrument);
                                                })
                                            }
                                        ];

                                        (d[0].value as {
                                            tagListType: number;
                                            list: number[];
                                        }).list[1] += 1;

                                        return d;
                                    })
                                ]
                            }
                        },
                        {
                            tagType: 9,
                            name: 'palette',
                            value: {
                                tagListType: 10,
                                list: blockList
                            }
                        },
                        {
                            tagType: 3,
                            name: 'DataVersion',
                            value: 3120
                        }
                    ]
                }
            ]
        };
    }

    toNBT() {
        return this.data;
    }
}
