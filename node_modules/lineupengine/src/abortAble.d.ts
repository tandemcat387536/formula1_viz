export interface IAbortAblePromise<T> extends Promise<T | symbol> {
    abort(): void;
}
export declare const ABORTED: unique symbol;
export default function abortAble<T>(loader: Promise<T>): {
    then<TResult1>(onfulfilled: (value: T) => TResult1 | PromiseLike<TResult1>): IAbortAblePromise<TResult1>;
};
export declare function isAbortAble(abortAble: IAbortAblePromise<any> | void | undefined | null): abortAble is IAbortAblePromise<any>;
