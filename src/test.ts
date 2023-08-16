import { NBTLoader, MIDINoteBlockParser, Direction } from '.';
import fs from 'fs';
import path from 'path';

const filePath = path.join('nbt', `${Date.now()}-test.json`);

if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const nbt = NBTLoader.instance();

const parser = new MIDINoteBlockParser(0, 'harp');

const parsed = parser.parse(fs.readFileSync('test.mid')).map((note) => note.data);

const joined = NBTLoader.combineNBT({
    direction: Direction.x
}, ...parsed);

fs.writeFileSync(filePath, JSON.stringify(joined, null, 4));

nbt.convertNBTFileFromJSON(filePath);
