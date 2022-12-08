import ArrayColumn, { IArrayColumnDesc } from './ArrayColumn';
import { ICategoricalDesc, ICategory } from './ICategoricalColumn';
import { IDataRow } from './interfaces';
export declare type ICategoricalsColumnDesc = ICategoricalDesc & IArrayColumnDesc<string | null>;
export default class CategoricalsColumn extends ArrayColumn<string | null> {
    readonly categories: ICategory[];
    private readonly missingCategory;
    private readonly lookup;
    constructor(id: string, desc: Readonly<ICategoricalsColumnDesc>);
    getCategories(row: IDataRow): (ICategory | null)[];
    getSet(row: IDataRow): Set<ICategory | null>;
    getValues(row: IDataRow): (string | null)[];
    getLabels(row: IDataRow): string[];
}
