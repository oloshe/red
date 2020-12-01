declare type RedSetOption = {
    force?: boolean;
    node?: RedNode;
};
export default class Red {
    private static instance;
    static getInstance(): Red;
    _listeners: {
        [path: string]: Array<{
            key: string;
            context?: any;
            callback: (number: number) => void;
        }>;
    };
    _initialPaths: string[];
    map: {
        [key: string]: number;
    };
    init(initialPaths: string[]): void;
    set(path: string, value: number | boolean, options?: RedSetOption): void;
    get(path: string): number;
    del(path: string): boolean;
    private _checkMap;
    fixToggle(path: string): boolean;
    dump(): void;
    on(path: string, callback: (num: number) => void, context?: any): string;
    off(path: string, key: string): void;
    private _notifyAll;
}
declare class RedNode {
    children: {
        [name: string]: RedNode;
    };
    name: string;
    parent: RedNode | null;
    value: number;
    isFixed: boolean;
    constructor(name: string, parent?: RedNode);
    addChild(path: string): boolean;
    fixToggle(): boolean;
    private static _brotherhood;
    static exec(source: RedNode, target: string | RedNode, value: number): boolean;
    find(path: string): RedNode | null;
    static getPath(node: RedNode): string;
}
export {};
