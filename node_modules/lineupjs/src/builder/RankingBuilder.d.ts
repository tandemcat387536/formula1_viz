import { EAdvancedSortMethod } from '../model';
import Ranking from '../model/Ranking';
import ADataProvider from '../provider/ADataProvider';
export interface IImposeColumnBuilder {
    type: 'impose';
    column: string;
    label?: string;
    categoricalColumn: string;
}
export interface INestedBuilder {
    type: 'nested';
    label?: string;
    columns: string[];
}
export interface IWeightedSumBuilder {
    type: 'weightedSum';
    columns: string[];
    label?: string;
    weights: number[];
}
export interface IReduceBuilder {
    type: 'min' | 'max' | 'mean' | 'median';
    columns: string[];
    label?: string;
}
export interface IScriptedBuilder {
    type: 'script';
    code: string;
    columns: string[];
    label?: string;
}
export default class RankingBuilder {
    private static readonly ALL_MAGIC_FLAG;
    private readonly columns;
    private readonly sort;
    private readonly groups;
    sortBy(column: string, asc?: boolean | 'asc' | 'desc'): this;
    groupBy(...columns: string[]): this;
    column(column: string | IImposeColumnBuilder | INestedBuilder | IWeightedSumBuilder | IReduceBuilder | IScriptedBuilder): this;
    impose(label: string | null, numberColumn: string, categoricalColumn: string): this;
    nested(label: string | null, column: string, ...columns: string[]): this;
    weightedSum(label: string | null, numberColumn1: string, weight1: number, numberColumn2: string, weight2: number, ...numberColumnAndWeights: (string | number)[]): this;
    reduce(label: string | null, operation: EAdvancedSortMethod, numberColumn1: string, numberColumn2: string, ...numberColumns: string[]): this;
    scripted(label: string | null, code: string, numberColumn1: string, numberColumn2: string, ...numberColumns: string[]): this;
    selection(): this;
    group(): this;
    aggregate(): this;
    rank(): this;
    supportTypes(): this;
    allColumns(): this;
    build(data: ADataProvider): Ranking;
}
export declare function buildRanking(): RankingBuilder;
