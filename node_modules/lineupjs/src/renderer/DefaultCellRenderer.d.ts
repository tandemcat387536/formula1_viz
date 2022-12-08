import Column from '../model/Column';
import { ERenderMode, ICellRendererFactory, IGroupCellRenderer, ISummaryRenderer, ICellRenderer } from './interfaces';
export declare class DefaultCellRenderer implements ICellRendererFactory {
    title: string;
    groupTitle: string;
    summaryTitle: string;
    canRender(_col: Column, _mode: ERenderMode): boolean;
    create(col: Column): ICellRenderer;
    createGroup(_col: Column): IGroupCellRenderer;
    createSummary(): ISummaryRenderer;
}
