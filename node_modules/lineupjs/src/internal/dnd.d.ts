export declare function hasDnDType(e: DragEvent, ...typesToCheck: string[]): boolean;
export declare type IDragEffect = 'none' | 'copy' | 'copyLink' | 'copyMove' | 'link' | 'linkMove' | 'move' | 'all';
export interface IDragStartResult {
    effectAllowed: IDragEffect;
    data: {
        [mimeType: string]: string;
    };
}
export interface IDropResult {
    effect: IDragEffect;
    data: {
        [mimeType: string]: string;
    };
}
