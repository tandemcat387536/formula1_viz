import LineUp from '../ui/LineUp';
import Taggle from '../ui/taggle/Taggle';
export * from './DataBuilder';
export * from './column';
export * from './RankingBuilder';
export * from './adapter';
export declare function asTaggle(node: HTMLElement, data: any[], ...columns: string[]): Taggle;
export declare function asLineUp(node: HTMLElement, data: any[], ...columns: string[]): LineUp;
