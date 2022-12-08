import Column, { IColumnDesc } from './Column';
export default class DummyColumn extends Column {
    constructor(id: string, desc: Readonly<IColumnDesc>);
    getLabel(): string;
    getValue(): string;
    compare(): number;
}
