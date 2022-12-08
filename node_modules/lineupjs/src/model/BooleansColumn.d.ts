import ArrayColumn, { IArrayColumnDesc } from './ArrayColumn';
import { ISetColumn } from './ICategoricalColumn';
import { IDataRow } from './interfaces';
export declare type IBooleansColumnDesc = IArrayColumnDesc<boolean>;
export default class BooleansColumn extends ArrayColumn<boolean> implements ISetColumn {
    constructor(id: string, desc: Readonly<IBooleansColumnDesc>);
    readonly categories: {
        name: string;
        label: string;
        color: string;
        value: number;
    }[];
    getSet(row: IDataRow): Set<{
        name: string;
        label: string;
        color: string;
        value: number;
    }>;
    compare(a: IDataRow, b: IDataRow): number;
}
