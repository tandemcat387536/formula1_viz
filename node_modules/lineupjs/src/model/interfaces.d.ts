export interface IStyleColumn {
    description: string;
    color: string;
    frozen: boolean;
    fixed: boolean;
    renderer: string;
    groupRenderer: string;
    summaryRenderer: string;
    width: number;
    visible: boolean;
}
export interface IColumnDesc extends Partial<IStyleColumn> {
    label: string;
    type: string;
}
export interface IDataRow {
    readonly v: any;
    readonly i: number;
}
export interface IGroup {
    name: string;
    color: string;
    parent?: Readonly<IGroupParent> | null;
}
export interface IGroupParent extends IGroup {
    subGroups: (Readonly<IGroupParent> | Readonly<IGroup>)[];
}
export interface IGroupItem extends IDataRow {
    readonly group: IGroup;
    readonly relativeIndex: number;
    readonly meta?: 'first' | 'last' | 'first last';
}
export interface IGroupData extends Readonly<IGroup> {
    readonly rows: IDataRow[];
}
export declare function isGroup(item: IGroupData | IGroupItem): item is IGroupData;
