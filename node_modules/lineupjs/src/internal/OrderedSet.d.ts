export default class OrderedSet<T> implements Iterable<T> {
    readonly [Symbol.toStringTag]: symbol;
    private readonly set;
    private readonly list;
    constructor(values?: T[]);
    readonly size: number;
    clear(): void;
    addAll(values: T[]): this;
    add(value: T): this;
    has(value: T): boolean;
    delete(value: T): boolean;
    deleteAll(values: T[]): boolean;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    [Symbol.iterator](): IterableIterator<T>;
}
