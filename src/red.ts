export { };
const log = console.log.bind(console, '🔴 ');
const error = console.error.bind(console, '🔴 ');
const warn = console.warn.bind(console, '🔴 ');
const splitter = "/";

class RedNode {
  /** 名字 */
  name: string
  /** 双亲 */
  parent: RedNode | null
  /** 财产 */
  _value: number = 0
  /** 固定（暂时没用上所以不写相关逻辑） */
  fixed: boolean = false
  /** 后代 */
  children: Record<string, RedNode> = {}
  /**
   * 血统 （等于旧版本红点的完整路径）
   */
  lineage: string

  /** 红点树 根结点 */
  static root = new RedNode("@root", null);

  constructor(name: string, parent: RedNode | null, lineage?: string) {
    this.name = name, this.parent = parent;
    if (lineage != void 0) {
      this.lineage = lineage
      return
    }
    // 历代血脉
    this.lineage = [...this]
      .map(x => x.name)
      .reverse()
      .join(splitter);
  }

  /**
   * 自身迭代器，从自己到祖先 (不包括 root)
   */
  *[Symbol.iterator]() {
    let dynasties: RedNode = this
    while (dynasties && dynasties.parent) {
      yield dynasties
      dynasties = dynasties.parent
    }
  }

  /** 添加孩子 */
  addChild(path: string): RedNode | null {
    if (path === "") return null;
    let keyNames = path.split(splitter);
    let node: RedNode = this;
    let len = keyNames.length, tmpPath = "";
    // 从第0个开始到倒数第2个
    for (let i = 0; i < len - 1; i++) {
      let k = keyNames[i];
      // 如果该字符串为空字符串时，会直接跳过。
      if (!k) { continue }
      tmpPath += k;
      if (node.children[k]) {
        node = node.children[k];
      } else {
        // 中间存在不存在的结点的时候可以自动为其添加结点。
        let newNode = new RedNode(k, node);
        node.children[k] = newNode;
        node = newNode;
      }
      tmpPath += splitter;
    }
    let leafKey = keyNames[len - 1];
    let newNode = new RedNode(leafKey, node, path);
    node.children[leafKey] = newNode;
    return newNode;
  }

  /** 在该结点上找到一个结点 */
  static find(node: RedNode, path: string, options: {
    /** 是否当找不到的时候插入新的结点 */
    insertWhenNull?: boolean
    /** 对找不找得到不关心的化就不用报错了 */
    careless?: boolean
  } = {}): RedNode | null {
    if (!path) return node;
    let nodeNames = path.split(splitter);
    let target: RedNode = node;
    for (let i = 0; i < nodeNames.length; i++) {
      let name = nodeNames[i];
      let child = target.children[name];
      if (!child) {
        // 动态新增红点
        if (options.insertWhenNull) {
          child = new RedNode(name, target)
          target.children[name] = child
        } else {
          !options.careless && error(`查找路径：${path} 失败！\n原因：不存在该红点。\n请确保 InitialPathArr 中包含该路径，或者该路径已经添加为动态结点。`, node.lineage);
          return null;
        }
      }
      target = child;
    }
    return target;
  }

  get value() {
    return this._value
  }

  set value(newValue: number) {
    if (newValue < 0) { newValue = 0 }

    // 相同值直接 return
    if (newValue == this._value) return;
    let delta = newValue - this._value;
    this._value += delta;

    log(`SET (${this.lineage}) = ${newValue}`);
    red._notifyAll(this.lineage, newValue);

    if (this.parent && this.parent.parent) {
      this.parent.value += delta;
    }
  }

  /** 忽略红点 深度优先遍历忽略所有子孙后代 */
  ignore() {
    if (this.isLeftNode) {
      this.value = 0;
    } else {
      for (let i in this.children) {
        this.children[i].ignore()
      }
    }
  }

  /** 是否是叶子结点 */
  get isLeftNode(): boolean {
    return Object.keys(this.children).length === 0
  }
}

interface SetOption {
  /** 强制增加结点（无该结点时） */
  force?: boolean
  /** 唯一标识，区分多状态红点的来源 */
  symbol?: string
}
interface ListenerData {
  /** 回调函数 */
  callback: (num: number) => void
  /** 上下文 */
  context: any
  /** 监听键 */
  key: Symbol
  /** 唯一建 */
  unionKey?: string
}

class red {
  static _initial_path_arr?: string[]
  /** 初始化红点树 */
  static init(initialPathArr: string[]) {
    red._initial_path_arr = initialPathArr;
    let len = initialPathArr.length;
    for (let i = 0; i < len; i++) {
      let path = initialPathArr[i]
      RedNode.root.addChild(path);
    }
  }
  /** 红点变化监听者 */
  static listeners: Record<string, ListenerData[]> = {}

  /** 联合状态字典 */
  static unionMap: Record<string, Map<string, number>> = {}

  /**
   * 判断路径时候能找到结点
   * @param path 路径
   * @param force 若为 true ，则不存在时自动添加结点
   * @returns 
   */
  static resolvePath(path: string, options: {
    /** 强制添加 */
    force?: boolean
    /** 是否对结果关心 */
    careless?: boolean
  } = {}): RedNode | null {
    if (path == '') return null;
    let ret = RedNode.find(RedNode.root, path, {
      insertWhenNull: !!options.force,
      careless: !!options.careless,
    })
    if (ret) {
      return ret
    } else {
      return null
    }

  }
  /**
   * 设置红点状态
   * @param path 路径
   * @param value 值
   * @param options 可选参数
   * @returns 
   */
  static set(path: string, value: boolean | number, options: SetOption = {}) {
    if (typeof value === "boolean") value = Number(value);
    if (typeof value !== 'number') { warn(`red.set('${path}', ${value}) 警告！\n类型需要为 boolean 或者 number，却收到了 ${typeof value} 类型。使用默认值：0`); value = 0 }
    let {
      symbol,
      force,
    } = options;
    let node = red.resolvePath(path, { force, careless: false });
    if (!node) {
      error(`red.set('${path}', ${value}) 失败! \n原因：路径不存在 \n若要添加动态结点请设置 force 为 true！\noptions:`, options);
      return
    }

    if (symbol) {
      let state = red.unionMap[path];
      if (!state) {
        state = new Map()
        red.unionMap[path] = state
      }
      if (typeof state.get(symbol) != void 0) {
        state.set(symbol, value)
        log(`${symbol} => ${value}`)
      }
      let num = 0
      state.forEach(v => num += v)
      value = num
    }

    if (!node.isLeftNode) {
      if (!red._non_leaf_node_change_lock_) {
        log('修改非叶子结点')
      } else {
        error(`red.set('${path}', ${value}) 失败!\n原因：正在设置非叶子结点的值，这将会造成父子元素不同步！\n请尽量避免这么干！\n如果不得不修改请使用 red.unsafe.set 方法来设置。`, node)
        return
      }
    }

    node.value = value
  }
  /**
   * 获取红点路径的值
   * @param path 
   * @param unionKey 
   * @returns 
   */
  static get(path: string, unionKey?: string): number {
    if (!unionKey) {
      let node = red.resolvePath(path, { careless: true });
      if (node) {
        return node.value
      } else {
        return 0
      }
    } else {
      let map = red.unionMap[path]
      if (map != void 0) {
        let ret = map.get(unionKey)
        if (ret !== void 0) {
          return ret
        } else {
          warn(`唯一值不存在`, path, unionKey)
          return 0
        }
      } else {
        warn(`路径对象不存在`, path, unionKey)
        return 0
      }

    }
  }
  /**
   * 删除一个动态红点
   * 会释放红点树和监听者占用的内存，此时监听函数将不会生效
   * @param path 
   */
  static del(path: string): boolean {
    if (!path) return false
    // 在初始化的红点中，默认不能删除，请使用 red.unsafe.del 删除
    if (red._initial_path_arr?.indexOf(path) != -1) {
      error(`删除红点 ${path} 失败！\n原因：该路径在初始化红点，默认不能删除，请使用 red.unsafe.del 删除。`)
      return false
    }
    return red.unsafe.del(path);
  }
  static unsafe = {
    /**
     * 设置红点状态
     * 
     * **此时可以设置非叶子结点的状态**
     * @param path 
     * @param value 
     * @param options 
     */
    set(path: string, value: boolean | number, options: SetOption = {}) {
      red._non_leaf_node_change_lock_ = false
      red.set(path, value, options)
      red._non_leaf_node_change_lock_ = true
    },

    /**
     * 删除任意一个红点
     * 会释放红点树和监听者占用的内存，此时监听函数将不会生效
     * @param path 
     */
    del(path: string): boolean {
      let del_node = red.resolvePath(path)
      if (del_node) {
        // 删除结点 触发连锁更新
        let del_path = del_node.lineage;
        red.unsafe.set(del_path, 0);

        // dfs 检查子结点
        const check_it_out = (node: RedNode) => {
          // 监听是否存在
          let path = node.lineage
          console.log(path)
          let arr = red.listeners[path]
          if (arr && arr.length) {
            warn(`删除红点：${node.lineage}`);
            delete red.listeners[path]
          }
          // 删除结点
          delete node.parent?.children[node.name]

          if (!node.isLeftNode) {
            // 删除非叶子结点需要把所有 children 干掉
            for (let i in node.children) {
              check_it_out(node.children[i]);
            }
          }
        }
        check_it_out(del_node)
        return true
      }
      return false
    }
  }
  /**
   * 监听 路径的红点如果值发生了变化会调用 callback
   * @param path 
   * @param options
   * @returns 
   */
  static on(path: string, options: {
    callback: (num: number) => void,
    context?: any
    unionKey?: string,
  }) {
    let { unionKey, context, callback } = options
    let key: Symbol
    if (typeof callback === "function") {
      if (!red.listeners[path]) red.listeners[path] = [];
      // @ts-ignore
      key = Symbol();
      red.listeners[path].push({ callback, context, unionKey, key });
    } else {
      error(`Listen (${path}) Failed: not a function`);
    }
    return { off: () => red.off(path, key) };
  }
  static clear(path: string) {
    let node = RedNode.find(RedNode.root, path);
    if (node) {
      node.ignore()
    }
  }
  /**
   * 取消监听红点
   * @param path 
   * @param key 
   * @returns 
   */
  static off(path: string, key: Symbol) {
    if (!red.listeners[path] || !key) return;
    let arr = red.listeners[path];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key === key) {
        arr.splice(i, 1);
        break;
      }
    }
    if (arr.length === 0) {
      delete red.listeners[path];
    }
  }
  /** 通知所有该路径上的监听者，值发生了变化，然后把值传递给对应的回调函数  */
  static _notifyAll(path: string, value: number) {
    if (!red.listeners[path]) return;
    let arr = red.listeners[path];
    for (let i = 0; i < arr.length; i++) {
      let { callback, context, unionKey } = arr[i];
      if (!unionKey) {
        callback.call(context || null, value);
      } else {
        callback.call(context || null, red.get(path, unionKey));
      }
    }
  }

  /** 防止非叶子结点被修改的锁, true => 不允许修改 false => 允许修改 */
  static _non_leaf_node_change_lock_: boolean = true

  /** 调试用 */
  static dump() {
    log("监听者", red.listeners);
    log("联合状态", red.unionMap);
    log("状态树:", RedNode.root);
    (function a(n, l) {
      let g = `${n.name} (${n.value})`;
      // @ts-ignore
      l === 1 && console.groupCollapsed(g);
      l > 1 && console.log(
        `${"\t".repeat(l - 1)}%c${n.name} -> %c${n.value}${n.fixed ? " [FIX]" : ""
        }`,
        n.value ? "" : "color:#777;",
        n.value ? "color:#f55;" : "color:#777;",
      );
      for (let i in n.children) {
        a(n.children[i], l + 1);
      }
      // @ts-ignore
      l === 1 && console.groupEnd(g);
    })(RedNode.root, 0);
  }
}

// module.exports = red;
export default red