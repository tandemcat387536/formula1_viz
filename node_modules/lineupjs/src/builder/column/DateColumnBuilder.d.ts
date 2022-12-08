import { IDateColumnDesc } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class DateColumnBuilder extends ColumnBuilder<IDateColumnDesc> {
    constructor(column: string);
    format(format: string, parse?: string): this;
}
export declare function buildDateColumn(column: string): DateColumnBuilder;
