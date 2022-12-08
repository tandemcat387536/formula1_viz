import { IExceptionContext } from '../../logic';
import { IColumn } from '../../style';
export interface ICellAdapterRenderContext<T extends IColumn> extends IExceptionContext {
    readonly column: IExceptionContext;
    readonly columns: T[];
}
