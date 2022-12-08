import { IDataRow } from './interfaces';
import MultiLevelCompositeColumn from './MultiLevelCompositeColumn';
export declare function createNestedDesc(label?: string): {
    type: string;
    label: string;
};
export default class NestedColumn extends MultiLevelCompositeColumn {
    compare(a: IDataRow, b: IDataRow): number;
    getLabel(row: IDataRow): string;
    getValue(row: IDataRow): string;
}
