import { IHierarchyColumnDesc, IPartialCategoryNode } from '../../model';
import ColumnBuilder from './ColumnBuilder';
export default class HierarchyColumnBuilder extends ColumnBuilder<IHierarchyColumnDesc> {
    constructor(column: string);
    hierarchy(hierarchy: IPartialCategoryNode, hierarchySeparator?: string): this;
    build(data: any[]): IHierarchyColumnDesc;
}
export declare function buildHierarchicalColumn(column: string, hierarchy?: IPartialCategoryNode): HierarchyColumnBuilder;
