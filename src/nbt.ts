import nbt from 'prismarine-nbt';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import zlib from 'zlib';

export enum Direction {
    x = 0,
    y = 1,
    z = 2
}

export type NBTTagValue = string | number | boolean | NBTTag | NBTTagValue[] | {
    tagListType: number;
    list: NBTTagValue;
    name?: string;
};

export type NBTTag = {
    tagType: number;
    name: string;
    value: NBTTagValue;
};

export type NBTJson = {
    name: string;
    version: string;
    nbt2JsonUrl: string;
    conversionTime: string;
    nbt: NBTTag[];
};

export default class NBTLoader {
    dir: string;
    nbtData: {
        [key: string]: {
            parsed: nbt.NBT;
            type: nbt.NBTFormat;
            metadata: nbt.Metadata;
        };
    };
    private static _instance: NBTLoader;

    private constructor(dir = path.join(__dirname, '..', 'nbt')) {
        if (!path.isAbsolute(dir)) {
            throw new Error('NBTLoader: dir must be an absolute path');
        }

        if (!fs.existsSync(dir)) {
            throw new Error('NBTLoader: dir does not exist');
        }

        this.dir = dir;
        this.nbtData = {};
    }

    async loadNBT(filename: string) {
        if (!filename.endsWith('.nbt')) {
            throw new Error('NBTLoader: filename must end with .nbt');
        }

        const filePath = path.join(this.dir, filename);

        if (!fs.existsSync(filePath)) {
            throw new Error('NBTLoader: file does not exist');
        }

        const trimmedFilename = path.basename(filename, '.nbt');

        const nbtData = await nbt.parse(fs.readFileSync(filePath));

        this.nbtData[trimmedFilename] = nbtData;

        return nbtData;
    }

    async loadAllNBT(batch = false) {
        const files = fs.readdirSync(this.dir);

        if (batch) {
            const promises = files.map((file) => this.loadNBT(file));

            await Promise.all(promises);
        } else {
            for (const file of files) {
                await this.loadNBT(file);
            }
        }
    }

    getNBT(filename: string) {
        if (!filename.endsWith('.nbt')) {
            throw new Error('NBTLoader: filename must end with .nbt');
        }

        const trimmedFilename = path.basename(filename, '.nbt');

        return this.nbtData[trimmedFilename];
    }

    convertNBTFileFromJSON(filename: string) {
        if (!filename.endsWith('.json')) {
            throw new Error('NBTLoader: filename must end with .json');
        }

        const trimmedFileBasename = path.basename(filename, '.json');

        const trimmedFilename = path.resolve(path.join(path.dirname(filename), trimmedFileBasename));

        const data = child_process.execSync(`nbt2json -r -b -i ${filename}`);

        // gzip the data
        const gzippedData = zlib.gzipSync(data);

        fs.writeFileSync(`${trimmedFilename}.nbt`, gzippedData);
    }

    convertNBTFileToJSON(filename: string) {
        if (!filename.endsWith('.nbt')) {
            throw new Error('NBTLoader: filename must end with .nbt');
        }

        const trimmedFileBasename = path.basename(filename, '.nbt');

        const trimmedFilename = path.resolve(path.join(path.dirname(filename), trimmedFileBasename));

        child_process.execSync(`json2nbt -b -i ${filename} -o ${trimmedFilename}.json`);
    }

    static instance(dir?: string) {
        if (!NBTLoader._instance) {
            return new NBTLoader(dir);
        }

        return NBTLoader._instance;
    }

    static destroy() {
        delete NBTLoader._instance;
    }

    static getNBTSize(nbt: NBTJson) {
        const { list } = ((nbt.nbt[0].value as NBTTagValue[])[0] as NBTTag).value as {
            tagListType: number;
            list: number[];
        };

        return {
            width: list[0],
            height: list[1],
            length: list[2]
        };
    }

    static combineNBT({
        direction,
        ...opts
    }: {
        direction: Direction;
        spacing?: Partial<{
            x: number;
            y: number;
            z: number;
        }>
    }, ...nbtTags: NBTJson[]) {
        // 0: x
        // 1: y
        // 2: z
        nbtTags.reverse();

        const sizes = nbtTags.map((nbt) => NBTLoader.getNBTSize(nbt));

        const width = sizes.reduce((acc, size) => direction === Direction.x ? acc + size.width : Math.max(acc, size.width), 0) + (opts.spacing?.x ?? 0) * (nbtTags.length - 1);
        const height = sizes.reduce((acc, size) => direction === Direction.y ? acc + size.height : Math.max(acc, size.height), 0) + (opts.spacing?.y ?? 0) * (nbtTags.length - 1);
        const length = sizes.reduce((acc, size) => direction === Direction.z ? acc + size.length : Math.max(acc, size.length), 0) + (opts.spacing?.z ?? 0) * (nbtTags.length - 1);

        const palette: NBTTagValue[] = [];
        const blocks: NBTTagValue[] = [];

        let x = 0;
        let y = 0;
        let z = 0;

        for (const nbt of nbtTags) {
            const list = (nbt.nbt[0].value as NBTTagValue[]) as NBTTag[];

            const paletteList = list.find((tag) => (tag as NBTTag).name === 'palette') as NBTTag;
            const blocksList = list.find((tag) => (tag as NBTTag).name === 'blocks') as NBTTag;

            const paletteListValue = (paletteList.value as { tagListType: number; list: NBTTagValue[] }).list;
            const blocksListValue = (blocksList.value as { tagListType: number; list: NBTTagValue[] }).list;

            for (const paletteTag of paletteListValue) {
                const stringifiedPaletteTag = JSON.stringify(paletteTag);

                if (!palette.find((tag) => JSON.stringify(tag) === stringifiedPaletteTag)) {
                    palette.push(paletteTag);
                }
            }

            for (let i = 0; i < blocksListValue.length; i++) {
                const paletteID = (blocksListValue[i] as NBTTag[]).find((tag) => tag.name === 'state').value as NBTTagValue;
                const paletteTag = paletteListValue[paletteID as number];

                const newPaletteIndex = palette.findIndex((tag) => JSON.stringify(tag) === JSON.stringify(paletteTag));

                const blockTag = blocksListValue[i] as NBTTag[];

                blockTag.find((tag) => tag.name === 'state').value = newPaletteIndex;

                (blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[] }).list = [
                    direction === 0 ? x + ((blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[] }).list as number[])[0] : ((blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[]; }).list as number[])[0],
                    direction === 1 ? y + ((blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[] }).list as number[])[1] : ((blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[]; }).list as number[])[1],
                    direction === 2 ? z + ((blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[] }).list as number[])[2] : ((blockTag.find((tag) => tag.name === 'pos').value as { tagListType: number; list: number[]; }).list as number[])[2]
                ];

                blocks.push(blockTag);

                if (i === blocksListValue.length - 1) {
                    switch (direction) {
                        case Direction.x:
                            x += sizes[0].width;
                            break;
                        case Direction.y:
                            y += sizes[0].height;
                            break;
                        case Direction.z:
                            z += sizes[0].length;
                            break;
                    }
                }
            }

            sizes.shift();

            if (opts.spacing) {
                switch (direction) {
                    case Direction.x:
                        x += opts.spacing.x;
                        break;
                    case Direction.y:
                        y += opts.spacing.y;
                        break;
                    case Direction.z:
                        z += opts.spacing.z;
                        break;
                }
            }
        }

        const nbt: NBTJson = {
            name: 'Schematic',
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
                                    width,
                                    height,
                                    length
                                ]
                            }
                        },
                        {
                            tagType: 9,
                            name: 'entities',
                            value: {
                                tagListType: 10,
                                list: null
                            }

                        },
                        {
                            tagType: 9,
                            name: 'blocks',
                            value: {
                                tagListType: 10,
                                list: blocks
                            }
                        },
                        {
                            tagType: 9,
                            name: 'palette',
                            value: {
                                tagListType: 10,
                                list: palette
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

        return nbt;
    }
}
