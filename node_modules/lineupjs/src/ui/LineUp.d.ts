import { ILineUpOptions } from '../interfaces';
import DataProvider from '../provider/ADataProvider';
import { ALineUp } from './ALineUp';
export { ILineUpOptions } from '../interfaces';
export default class LineUp extends ALineUp {
    private readonly renderer;
    private readonly panel;
    private readonly options;
    constructor(node: HTMLElement, data: DataProvider, options?: Partial<ILineUpOptions>);
    destroy(): void;
    update(): void;
    setDataProvider(data: DataProvider, dump?: any): void;
    setHighlight(dataIndex: number, scrollIntoView?: boolean): boolean;
    getHighlight(): number;
    protected enableHighlightListening(enable: boolean): void;
}
