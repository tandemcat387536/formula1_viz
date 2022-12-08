import ValueColumn, { IValueColumnDesc } from './ValueColumn';
export declare function createRankDesc(label?: string): {
    type: string;
    label: string;
};
export default class RankColumn extends ValueColumn<number> {
    constructor(id: string, desc: IValueColumnDesc<number>);
    readonly frozen: boolean;
}
