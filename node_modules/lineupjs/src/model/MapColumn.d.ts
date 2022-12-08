import { IKeyValue, IMapColumn } from './IArrayColumn';
import { IDataRow } from './interfaces';
import ValueColumn, { IValueColumnDesc } from './ValueColumn';
export interface IMapColumnDesc<T> extends IValueColumnDesc<IKeyValue<T>[]> {
}
export default class MapColumn<T> extends ValueColumn<IKeyValue<T>[]> implements IMapColumn<T> {
    constructor(id: string, desc: Readonly<IMapColumnDesc<T>>);
    getValue(row: IDataRow): IKeyValue<T>[];
    getLabels(row: IDataRow): IKeyValue<string>[];
    getMap(row: IDataRow): IKeyValue<T>[];
    getMapLabel(row: IDataRow): IKeyValue<string>[];
    getLabel(row: IDataRow): string;
}
