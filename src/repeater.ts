import { NBTJson } from './nbt';
export default class Repeater {
    delay: number;
    locked: boolean;
    powered: boolean;
    facing: 'north' | 'east' | 'south' | 'west';

    data: NBTJson;

    static MAX_DELAY = 4;

    constructor(delay = 1, locked = false, powered = false, facing: 'north' | 'east' | 'south' | 'west' = 'north') {
        this.delay = delay;
        this.locked = locked;
        this.powered = powered;
        this.facing = facing;

        this.data = {
            name: `Repeater ${delay} ${locked} ${powered} ${facing}`,
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
                                    [
                                        {
                                            tagType: 9,
                                            name: 'pos',
                                            value: {
                                                tagListType: 3,
                                                list: [
                                                    0,
                                                    1,
                                                    1
                                                ]
                                            }
                                        },
                                        {
                                            tagType: 3,
                                            name: 'state',
                                            value: 0
                                        }
                                    ],
                                    [
                                        {
                                            tagType: 9,
                                            name: 'pos',
                                            value: {
                                                tagListType: 3,
                                                list: [
                                                    0,
                                                    0,
                                                    1
                                                ]
                                            }
                                        },
                                        {
                                            tagType: 3,
                                            name: 'state',
                                            value: 1
                                        }
                                    ]
                                ]
                            }
                        },
                        {
                            tagType: 9,
                            name: 'palette',
                            value: {
                                tagListType: 10,
                                list: [
                                    [
                                        {
                                            tagType: 10,
                                            name: 'Properties',
                                            value: [
                                                {
                                                    tagType: 8,
                                                    name: 'delay',
                                                    value: delay.toString()
                                                },
                                                {
                                                    tagType: 8,
                                                    name: 'powered',
                                                    value: powered.toString()
                                                },
                                                {
                                                    tagType: 8,
                                                    name: 'facing',
                                                    value: facing
                                                },
                                                {
                                                    tagType: 8,
                                                    name: 'locked',
                                                    value: locked.toString()
                                                }
                                            ]
                                        },
                                        {
                                            tagType: 8,
                                            name: 'Name',
                                            value: 'minecraft:repeater'
                                        }
                                    ],
                                    [
                                        {
                                            tagType: 10,
                                            name: 'Properties',
                                            value: [
                                                {
                                                    tagType: 8,
                                                    name: 'snowy',
                                                    value: 'false'
                                                }
                                            ]
                                        },
                                        {
                                            tagType: 8,
                                            name: 'Name',
                                            value: 'minecraft:grass_block'
                                        }
                                    ]
                                ]
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
}
