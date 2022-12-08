import { IDataRow } from '../model';
import Column from '../model/Column';
export declare function renderMissingValue(ctx: CanvasRenderingContext2D, width: number, height: number, x?: number, y?: number): void;
export declare function renderMissingDOM(node: HTMLElement, col: Column, d: IDataRow): boolean;
export declare function renderMissingCanvas(ctx: CanvasRenderingContext2D, col: Column, d: IDataRow, width: number, x?: number, y?: number): boolean;
