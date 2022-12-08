import { IGroup } from './interfaces';
export interface IOrderedGroup extends IGroup {
    order: number[];
}
export declare const defaultGroup: IGroup;
