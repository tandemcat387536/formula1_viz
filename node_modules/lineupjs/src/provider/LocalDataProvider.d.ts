import Column, { IColumnDesc, IDataRow, INumberColumn, IOrderedGroup } from '../model';
import Ranking from '../model/Ranking';
import ACommonDataProvider from './ACommonDataProvider';
import { IDataProviderOptions, IStatsBuilder } from './ADataProvider';
export interface ILocalDataProviderOptions {
    filterGlobally: boolean;
    jumpToSearchResult: boolean;
    maxNestedSortingCriteria: number;
    maxGroupColumns: number;
}
export default class LocalDataProvider extends ACommonDataProvider {
    private _data;
    private options;
    private readonly reorderAll;
    private _dataRows;
    private filter;
    constructor(_data: any[], columns?: IColumnDesc[], options?: Partial<ILocalDataProviderOptions & IDataProviderOptions>);
    setFilter(filter: ((row: IDataRow) => boolean) | null): void;
    getFilter(): ((row: IDataRow) => boolean) | null;
    getTotalNumberOfRows(): number;
    protected getMaxGroupColumns(): number;
    protected getMaxNestedSortingCriteria(): number;
    readonly data: any[];
    setData(data: any[]): void;
    clearData(): void;
    appendData(data: any[]): void;
    cloneRanking(existing?: Ranking): Ranking;
    cleanUpRanking(ranking: Ranking): void;
    sortImpl(ranking: Ranking): IOrderedGroup[];
    viewRaw(indices: number[]): any[];
    viewRawRows(indices: number[]): IDataRow[];
    view(indices: number[]): any[];
    fetch(orders: number[][]): IDataRow[][];
    stats(indices: number[]): IStatsBuilder;
    mappingSample(col: INumberColumn): number[];
    searchAndJump(search: string | RegExp, col: Column): void;
}
