export { setDebugLevel } from "./log";
declare type RedSetOption = {
    /** 是否强制增加结点 */
    force?: boolean;
    /** 指定结点 */
    node?: RedNode;
};
export default class Red {
    /** 单例 */
    private static instance;
    static getInstance(): Red;
    /**
     * 监听者
     */
    private _listeners;
    /** 初始化路径数组 */
    private _initialPaths;
    /** 红点数据 */
    private map;
    /**
     * 初始化
     * @param initialPaths 初始化路径
     */
    init(initialPaths: string[]): void;
    /**
     * 设置红点
     * @param path 红点路径
     * @param value 值
     * @param options 选项
     */
    set(path: string, value: number | boolean, options?: RedSetOption): void;
    /**
     * 获取红点状态
     * @param path 红点路径
     */
    get(path: string): number;
    /**
     * 删除红点
     *
     * *仅动态创建的结点*
     * @param path 红点路径
     */
    del(path: string): boolean;
    /**
     * 检查红点数据
     * @param path 红点路径
     * @param force 是否强制增加结点
     */
    private _checkMap;
    /**
     * 切换固定状态
     * @param path 红点路径
     */
    fixToggle(path: string): boolean;
    dump(): void;
    /**
     * 订阅监听红点状态
     * @param path 红点路径
     * @param callback 回调函数
     * @param context 回调上下文
     */
    on(path: string, callback: (num: number) => void, context?: any): string;
    /**
     * 关闭监听
     * @param path 红点路径
     * @param key 红点监听钥匙（red.on返回）
     */
    off(path: string, key: string): void;
    /**
     * 红点变化通知所有监听者
     * @param path 红点路径
     * @param value 值
     */
    private _notifyAll;
}
/** 红点结点 */
declare class RedNode {
    children: {
        [name: string]: RedNode;
    };
    name: string;
    parent: RedNode | null;
    value: number;
    isFixed: boolean;
    constructor(name: string, parent?: RedNode);
    /**
     * 添加子结点
     * @param path 红点路径
     * @param callback 红点set的回调，用于设置临时创建的结点
     */
    addChild(path: string, callback?: (path: string) => void): boolean;
    /**
     * 切换固定状态
     * 解除固定后自动更行自身值
     */
    fixToggle(): boolean;
    /**
     * 兄弟齐心，获取parent结点所有子辈的值总和
     * @param parent 目标父节点
     */
    private static _brotherhood;
    /**
     * 执行更新
     * @param source 源结点
     * @param target 目标结点
     * @param value 值
     */
    static exec(source: RedNode, target: string | RedNode, value: number): boolean;
    /**
     * 在目标节点下寻找子节点
     * @param path 路径
     */
    find(path: string): RedNode | null;
    /**
     * 获取结点完整的路径
     * @param node 结点
     */
    static getPath(node: RedNode): string;
}
