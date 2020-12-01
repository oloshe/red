import { log, warn, error } from "./log";


type RedSetOption = {
  force?: boolean
  node?: RedNode
}

const SPLITTER = '/'

export default class Red {
  private static instance: Red;
  static getInstance(): Red {
    if (!this.instance) {
      this.instance = new Red();
    }
    return this.instance;
  }

  _listeners: {
    [path: string]: Array<{
      key: string
      context?: any
      callback: (number: number) => void
    }>
  } = {}

  _initialPaths: string[] = []

  map: {
    [key: string]: number,
  } = {}

  constructor() {}

  init(initialPaths: string[]) {
    this._initialPaths = initialPaths;
    initialPaths.forEach(path => {
      this.map[path] = 0;
      tree.addChild(path);
    })
  }

  set(path: string, value: number | boolean, options?: RedSetOption) {
    if (typeof value === 'boolean') value = Number(value)

    if (this.map[path] === value || this._checkMap(path, options?.force)) { return }
    log(`SET (${path}) = ${value}`)
    this.map[path] = value
    RedNode.exec(tree, options?.node ? options.node : path, value)
    this._notifyAll(path, value)
  }

  get(path: string): number {
    let result = red.map[path]
    if (this._checkMap(path)) { return 0 }
    return result
  }

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

  private _checkMap(path: string, force?: boolean) {
    let isVoid = this.map[path] === void 0
    if (!isVoid) { return false}
    if (force) {
        let ret = tree.addChild(path)
        if (!ret) {
          error(`NEW (${path}) Failed`)
        }
        return !ret
    }
    warn(`GET (${path}) Failed: please register: ${path}`)
    return true
  }

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

  addChild(path: string) {
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
        red.map[tmpPath] = 0
      }
      tmpPath += SPLITTER
    }
    let leafKey = keyNames[len - 1]
    let newNode = new RedNode(leafKey, node)
    node.children[leafKey] = newNode
    return true
  }

  fixToggle() {
    let isFixed = this.isFixed = !this.isFixed
    if (!isFixed) {
      let ret = RedNode._brotherhood(this)
      red.set(RedNode.getPath(this), ret)
    }
    return isFixed
  }

  private static _brotherhood(parent: RedNode) {
    let total = 0
    if (parent) {
      let children = parent.children
      for (let i in children) {
        total += children[i].value
      }
    }
    return total
  }

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