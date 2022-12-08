import { IColumnDesc, IDataRow } from '../model';
import { IOrderedGroup } from '../model/Group';
import Ranking from '../model/Ranking';
import ADataProvider, { IDataProviderOptions } from './ADataProvider';
declare abstract class ACommonDataProvider extends ADataProvider {
    private columns;
    private rankingIndex;
    private readonly ranks;
    constructor(columns?: IColumnDesc[], options?: Partial<IDataProviderOptions>);
    protected rankAccessor(row: IDataRow, _id: string, _desc: IColumnDesc, ranking: Ranking): number;
    protected getMaxNestedSortingCriteria(): number;
    protected getMaxGroupColumns(): number;
    cloneRanking(existing?: Ranking): Ranking;
    cleanUpRanking(ranking: Ranking): void;
    sort(ranking: Ranking): Promise<IOrderedGroup[]> | IOrderedGroup[];
    protected abstract sortImpl(ranking: Ranking): Promise<IOrderedGroup[]> | IOrderedGroup[];
    pushDesc(column: IColumnDesc): void;
    clearColumns(): void;
    getColumns(): IColumnDesc[];
    findDesc(ref: string): IColumnDesc;
    toDescRef(desc: any): any;
    deriveDefault(addSupportType?: boolean): Ranking;
    fromDescRef(descRef: any): any;
    restore(dump: any): void;
    nextRankingId(): string;
}
export default ACommonDataProvider;
