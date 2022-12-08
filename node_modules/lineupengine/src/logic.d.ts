export interface IRowHeightException {
    readonly index: number;
    readonly height: number;
    readonly y: number;
    readonly y2: number;
}
export interface IRowHeightExceptionLookup {
    keys(): IterableIterator<number>;
    get(index: number): number | undefined;
    has(index: number): boolean;
    readonly size: number;
}
export interface IExceptionContext {
    readonly exceptions: IRowHeightException[];
    readonly exceptionsLookup: IRowHeightExceptionLookup;
    readonly numberOfRows: number;
    readonly defaultRowHeight: number;
    readonly totalHeight: number;
    readonly padding: (index: number) => number;
}
export declare function uniformContext(numberOfRows: number, rowHeight: number, rowPadding?: number): IExceptionContext;
export declare function nonUniformContext(rowHeights: {
    forEach: (callback: (height: number, index: number) => any) => any;
}, defaultRowHeight?: number, rowPadding?: number | ((index: number) => number)): IExceptionContext;
export declare function randomContext(numberOfRows: number, defaultRowHeight: number, minRowHeight?: number, maxRowHeight?: number, ratio?: number, seed?: number): IExceptionContext;
export interface IVisibleRange {
    readonly first: number;
    readonly last: number;
    readonly firstRowPos: number;
    readonly endPos: number;
}
export declare function range(scrollTop: number, clientHeight: number, rowHeight: number, heightExceptions: IRowHeightException[], numberOfRows: number): IVisibleRange;
export declare function frozenDelta(current: number[], target: number[]): {
    added: number[];
    removed: number[];
    common: number;
};
export declare function updateFrozen(old: number[], columns: {
    frozen: boolean;
}[], first: number): {
    target: number[];
    added: number[];
    removed: number[];
};
