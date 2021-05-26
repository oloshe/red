export {};
declare class RedNode {
    /** 名字 */
    name: string;
    /** 双亲 */
    parent: RedNode | null;
    /** 财产 */
    _value: number;
    /** 固定（暂时没用上所以不写相关逻辑） */
    fixed: boolean;
    /** 后代 */
    children: Record<string, RedNode>;
    /**
     * 血统 （等于旧版本红点的完整路径）
     */
    lineage: string;
    /** 红点树 根结点 */
    static root: RedNode;
    constructor(name: string, parent: RedNode | null, lineage?: string);
    /**
     * 自身迭代器，从自己到祖先 (不包括 root)
     */
    [Symbol.iterator](): Generator<RedNode, void, unknown>;
    /** 添加孩子 */
    addChild(path: string): RedNode | null;
    /** 在该结点上找到一个结点 */
    static find(node: RedNode, path: string, options?: {
        /** 是否当找不到的时候插入新的结点 */
        insertWhenNull?: boolean;
        /** 对找不找得到不关心的化就不用报错了 */
        careless?: boolean;
    }): RedNode | null;
    get value(): number;
    set value(newValue: number);
    /** 忽略红点 深度优先遍历忽略所有子孙后代 */
    ignore(): void;
    /** 是否是叶子结点 */
    get isLeftNode(): boolean;
}
interface SetOption {
    /** 强制增加结点（无该结点时） */
    force?: boolean;
    /** 唯一标识，区分多状态红点的来源 */
    symbol?: string;
}
interface ListenerData {
    /** 回调函数 */
    callback: (num: number) => void;
    /** 上下文 */
    context: any;
    /** 监听键 */
    key: Symbol;
    /** 唯一建 */
    unionKey?: string;
}
declare class red {
    static _initial_path_arr?: string[];
    /** 初始化红点树 */
    static init(initialPathArr: string[]): void;
    /** 红点变化监听者 */
    static listeners: Record<string, ListenerData[]>;
    /** 联合状态字典 */
    static unionMap: Record<string, Map<string, number>>;
    /**
     * 判断路径时候能找到结点
     * @param path 路径
     * @param force 若为 true ，则不存在时自动添加结点
     * @returns
     */
    static resolvePath(path: string, options?: {
        /** 强制添加 */
        force?: boolean;
        /** 是否对结果关心 */
        careless?: boolean;
    }): RedNode | null;
    /**
     * 设置红点状态
     * @param path 路径
     * @param value 值
     * @param options 可选参数
     * @returns
     */
    static set(path: string, value: boolean | number, options?: SetOption): void;
    /**
     * 获取红点路径的值
     * @param path
     * @param unionKey
     * @returns
     */
    static get(path: string, unionKey?: string): number;
    /**
     * 删除一个动态红点
     * 会释放红点树和监听者占用的内存，此时监听函数将不会生效
     * @param path
     */
    static del(path: string): boolean;
    static unsafe: {
        /**
         * 设置红点状态
         *
         * **此时可以设置非叶子结点的状态**
         * @param path
         * @param value
         * @param options
         */
        set(path: string, value: boolean | number, options?: SetOption): void;
        /**
         * 删除任意一个红点
         * 会释放红点树和监听者占用的内存，此时监听函数将不会生效
         * @param path
         */
        del(path: string): boolean;
    };
    /**
     * 监听 路径的红点如果值发生了变化会调用 callback
     * @param path
     * @param options
     * @returns
     */
    static on(path: string, options: {
        callback: (num: number) => void;
        context?: any;
        unionKey?: string;
    }): {
        off: () => void;
    };
    static clear(path: string): void;
    /**
     * 取消监听红点
     * @param path
     * @param key
     * @returns
     */
    static off(path: string, key: Symbol): void;
    /** 通知所有该路径上的监听者，值发生了变化，然后把值传递给对应的回调函数  */
    static _notifyAll(path: string, value: number): void;
    /** 防止非叶子结点被修改的锁, true => 不允许修改 false => 允许修改 */
    static _non_leaf_node_change_lock_: boolean;
    /** 调试用 */
    static dump(): void;
}
export default red;
