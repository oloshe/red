import { log, warn, error } from "./log";
export { setDebugLevel } from "./log"

type RedSetOption = {
  /** 是否强制增加结点 */
  force?: boolean
  /** 指定结点 */
  node?: RedNode
}

const SPLITTER = '/'

export default class Red {
  /** 单例 */
  private static instance: Red;
  static getInstance(): Red {
    if (!this.instance) {
      this.instance = new Red();
    }
    return this.instance;
  }

  /**
   * 监听者
   */
  private _listeners: {
    [path: string]: Array<{
      key: string
      context?: any
      callback: (number: number) => void
    }>
  } = {}

  /** 初始化路径数组 */
  private _initialPaths: string[] = []

  /** 红点数据 */
  private map: {
    [key: string]: number,
  } = {}

  /**
   * 初始化
   * @param initialPaths 初始化路径
   */
  init(initialPaths: string[]) {
    this._initialPaths = initialPaths;
    initialPaths.forEach(path => {
      this.map[path] = 0;
      tree.addChild(path);
    })
  }

  /**
   * 设置红点
   * @param path 红点路径
   * @param value 值
   * @param options 选项
   */
  set(path: string, value: number | boolean, options?: RedSetOption) {
    if (typeof value === 'boolean') value = Number(value)
    if (this.map[path] === value || this._checkMap(path, options?.force)) { return }
    log(`SET (${path}) = ${value}`)
    this.map[path] = value
    RedNode.exec(tree, options?.node ? options.node : path, value)
    this._notifyAll(path, value)
  }

  /**
   * 获取红点状态
   * @param path 红点路径
   */
  get(path: string): number {
    let result = red.map[path]
    if (this._checkMap(path)) { return 0 }
    return result
  }

  /**
   * 删除红点
   * 
   * *仅动态创建的结点*
   * @param path 红点路径
   */
  del(path: string) {
    if (this.map[path] === void 0) { return false }
    if (this._initialPaths.indexOf(path) !== -1) {
        warn(`DEL (${path}) FAIL: can't delete Initialized path`)
        return false
    }
    let node = tree.find(path)
    if (!node) { return false }
    RedNode.exec(tree, node, 0)
    delete this.map[path]
    node.parent && delete node.parent.children[node.name]
    log(`DEL (${path})`)
    return true
  }

  /**
   * 检查红点数据
   * @param path 红点路径
   * @param force 是否强制增加结点
   */
  private _checkMap(path: string, force?: boolean) {
    let isVoid = this.map[path] === void 0
    if (!isVoid) { return false}
    if (force) {
        let ret = tree.addChild(path, p => this.map[p] = 0)
        if (!ret) {
          error(`NEW (${path}) Failed`)
        }
        return !ret
    }
    warn(`GET (${path}) Failed: please register: ${path}`)
    return true
  }

  /**
   * 切换固定状态
   * @param path 红点路径
   */
  fixToggle(path: string) {
    let node = tree.find(path)
    if (!node) { return false }
    return node.fixToggle()
  }

  dump() {
    log('map', this.map)
    log('listeners', this._listeners)
    log('tree:')
    ; (function a(n, l) {
        l === 1 && console.groupCollapsed(`${n.name} (${n.value})`)
        l > 1 && console.log(
            `${'\t'.repeat(l - 1)}%c${n.name} -> %c${n.value}${n.isFixed?' [FIX]':''}`,
            n.value ? '' : 'color:#777;',
            n.value ? 'color:#f55;' : 'color:#777;')
        for (let i in n.children) {
            a(n.children[i], l + 1)
        }
        l === 1 && console.groupEnd()
    })(tree, 0)
  }

/*
        _                                        
       | |                                       
  ___  | |__   ___   ___  _ __ __   __ ___  _ __ 
 / _ \ | '_ \ / __| / _ \| '__|\ \ / // _ \| '__|
| (_) || |_) |\__ \|  __/| |    \ V /|  __/| |   
 \___/ |_.__/ |___/ \___||_|     \_/  \___||_|   

*/

  /**
   * 订阅监听红点状态
   * @param path 红点路径
   * @param callback 回调函数
   * @param context 回调上下文
   */
  on(path: string, callback: (num: number) => void, context?: any) {
    if (typeof callback === 'function') {
      if (!this._listeners[path]) { this._listeners[path] = [] }
      let key = (Math.random() * 10 ** 10).toFixed(0);
      this._listeners[path].push({ callback, context, key })
      return key
    }
    error(`Listen (${path}) Failed: not a function`)
    return ''
  }

  /**
   * 关闭监听
   * @param path 红点路径
   * @param key 红点监听钥匙（red.on返回）
   */
  off(path: string, key: string) {
    if (!this._listeners[path]) { return }
    let arr = this._listeners[path];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].key === key) {
            arr.splice(i, 1)
            break;
        }
    }
    if (arr.length === 0) {
        delete this._listeners[path]
    }
  }

  /**
   * 红点变化通知所有监听者
   * @param path 红点路径
   * @param value 值
   */
  private _notifyAll(path: string, value: number) {
    if (!this._listeners[path]) { return }
    let arr = this._listeners[path];
    for (let i = 0; i < arr.length; i++) {
        let { callback, context } = arr[i]
        callback.call(context || null, value)
    }
  }
}

/*
 _                 
| |                
| |_ _ __ ___  ___ 
| __| '__/ _ \/ _ \
| |_| | |  __/  __/
 \__|_|  \___|\___|              

*/

/** 红点结点 */
class RedNode {
  children: {
    [name: string]: RedNode
  } = {}
  name: string
  parent: RedNode | null
  value: number
  isFixed: boolean

  constructor(name: string, parent?: RedNode) {
    this.name = name
    this.value = 0
    this.isFixed = false
    this.parent = parent ?? null
  }

  /**
   * 添加子结点
   * @param path 红点路径
   * @param callback 红点set的回调，用于设置临时创建的结点
   */
  addChild(path: string, callback?: (path: string) => void) {
    if (path === '') { return false }
    let keyNames = path.split(SPLITTER)
    let node: RedNode = this
    let len = keyNames.length, tmpPath = ''
    for (let i = 0; i < len - 1; i++) {
      let k = keyNames[i]
      tmpPath += k
      if (node.children[k]) {
        node = node.children[k]
      } else {
        // across
        let newNode = new RedNode(k, node)
        node.children[k] = newNode
        node = newNode
        callback?.(tmpPath)
      }
      tmpPath += SPLITTER
    }
    let leafKey = keyNames[len - 1]
    let newNode = new RedNode(leafKey, node)
    node.children[leafKey] = newNode
    return true
  }

  /**
   * 切换固定状态
   * 解除固定后自动更行自身值
   */
  fixToggle() {
    let isFixed = this.isFixed = !this.isFixed
    if (!isFixed) {
      let ret = RedNode._brotherhood(this)
      red.set(RedNode.getPath(this), ret)
    }
    return isFixed
  }

  /**
   * 兄弟齐心，获取parent结点所有子辈的值总和
   * @param parent 目标父节点
   */
  private static _brotherhood(parent: RedNode) {
    let total = 0
    let children = parent.children
    for (let i in children) {
      total += children[i].value
    }
    return total
  }

  /**
   * 执行更新
   * @param source 源结点
   * @param target 目标结点
   * @param value 值
   */
  static exec(source: RedNode, target: string | RedNode, value: number) {
    let node: RedNode
    if (typeof target === 'string') {
      let ret = source.find(target);
      if (ret === null) { return false }
      node = ret
    } else {
      node = target
    }
    if (node.value === value) { return true }
    node.value = value
    let parent = node.parent
    if (node && parent && parent.parent) {
      let ret = RedNode._brotherhood(parent)
      if (ret !== parent.value && !parent.isFixed) {
        let k = RedNode.getPath(parent)
        red.set(k, ret, {
          node: parent
        })
      }
    }
    return true
  }

  /**
   * 在目标节点下寻找子节点
   * @param path 路径
   */
  find(path: string) {
    if (!path) { return this }
    let nodeNames = path.split(SPLITTER)
    let node: RedNode = this
    for (let i = 0; i < nodeNames.length; i++) {
      let child = node.children[nodeNames[i]]
      if (!child) {
        error(`Find (${path}) Failed`)
        return null
      }
      node = child
    }
    return node
  }

  /**
   * 获取结点完整的路径
   * @param node 结点
   */  
  static getPath(node: RedNode) {
    let names = []
    while (node && node.parent) {
      names.push(node.name)
      node = node.parent
    }
    let ret = names.reverse().join(SPLITTER)
    return ret
  }
}
const red = Red.getInstance();
const tree = new RedNode('root');