import { default as Column, IColumnDesc } from '../model/Column';
import Ranking from '../model/Ranking';
export interface IDeriveOptions {
    categoricalThreshold: number;
    columns: string[];
}
export declare function deriveColumnDescriptions(data: any[], options?: Partial<IDeriveOptions>): IColumnDesc[];
export declare function deriveColors(columns: IColumnDesc[]): IColumnDesc[];
export interface IExportOptions {
    separator: string;
    newline: string;
    header: boolean;
    quote: boolean;
    quoteChar: string;
    filter: (col: Column) => boolean;
    verboseColumnHeaders: boolean;
}
export declare function exportRanking(ranking: Ranking, data: any[], options?: Partial<IExportOptions>): string;
