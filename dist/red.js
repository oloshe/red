import { log, warn, error } from "./log";
export { setDebugLevel } from "./log";
var SPLITTER = '/';
var Red = /** @class */ (function () {
    function Red() {
        /**
         * 监听者
         */
        this._listeners = {};
        /** 初始化路径数组 */
        this._initialPaths = [];
        /** 红点数据 */
        this.map = {};
    }
    Red.getInstance = function () {
        if (!this.instance) {
            this.instance = new Red();
        }
        return this.instance;
    };
    /**
     * 初始化
     * @param initialPaths 初始化路径
     */
    Red.prototype.init = function (initialPaths) {
        var _this = this;
        this._initialPaths = initialPaths;
        initialPaths.forEach(function (path) {
            _this.map[path] = 0;
            tree.addChild(path);
        });
    };
    /**
     * 设置红点
     * @param path 红点路径
     * @param value 值
     * @param options 选项
     */
    Red.prototype.set = function (path, value, options) {
        if (typeof value === 'boolean')
            value = Number(value);
        var force = options === null || options === void 0 ? void 0 : options.force;
        if (this.map[path] === value || this._checkMap(path, force)) {
            return;
        }
        log("SET (" + path + ") = " + value + (force ? ' 📌' : ''));
        this.map[path] = value;
        RedNode.exec(tree, (options === null || options === void 0 ? void 0 : options.node) ? options.node : path, value);
        this._notifyAll(path, value);
    };
    /**
     * 获取红点状态
     * @param path 红点路径
     */
    Red.prototype.get = function (path) {
        var result = red.map[path];
        if (this._checkMap(path)) {
            return 0;
        }
        return result;
    };
    /**
     * 删除红点
     *
     * *仅可删除动态创建的结点*
     * @param path 红点路径
     */
    Red.prototype.del = function (path) {
        if (this.map[path] === void 0) {
            return false;
        }
        if (this._initialPaths.indexOf(path) !== -1) {
            error("DEL (" + path + ") FAIL: can't delete Initialized path");
            return false;
        }
        if (this._listeners[path] && this._listeners[path].length > 0) {
            warn("DEL (" + path + ") warn: It's still exists listener(s), please cancel listening use red.off");
        }
        var node = tree.find(path);
        if (!node) {
            return false;
        }
        RedNode.exec(tree, node, 0);
        this._del(path, node);
        log("DEL (" + path + ")");
        return true;
    };
    /**
     * 删除结点的方法
     * @param path 红点路径
     * @param node 结点
     */
    Red.prototype._del = function (path, node) {
        var _this = this;
        var delByPath = function (path) {
            // 删除所有Map上的数据
            delete _this.map[path];
            // 删除所有监听者
            delete _this._listeners[path];
            // 没有必要通知监听者
            // 删除红点前通常也会把对应的组件给销毁了
        };
        var map = this.map, pathPrefix = path + SPLITTER;
        delByPath(path);
        for (var p in map) {
            if (p.startsWith(pathPrefix)) {
                delByPath(p);
            }
        }
        // 删除所有Tree上的数据
        node.parent && delete node.parent.children[node.name];
    };
    /**
     * 检查红点数据
     * @param path 红点路径
     * @param force 是否强制增加结点
     */
    Red.prototype._checkMap = function (path, force) {
        var _this = this;
        var isVoid = this.map[path] === void 0;
        if (!isVoid) {
            return false;
        }
        if (force) {
            var ret = tree.addChild(path, function (p) { return _this.map[p] = 0; });
            if (!ret) {
                error("NEW (" + path + ") Failed");
            }
            return !ret;
        }
        warn("GET (" + path + ") Failed: please register: " + path);
        return true;
    };
    /**
     * 切换固定状态
     * @param path 红点路径
     */
    Red.prototype.fixToggle = function (path) {
        var node = tree.find(path);
        if (!node) {
            return false;
        }
        return node.fixToggle();
    };
    Red.prototype.dump = function () {
        log('map', this.map);
        log('listeners', this._listeners);
        log('tree:');
        (function a(n, l) {
            l === 1 && console.groupCollapsed(n.name + " (" + n.value + ")");
            l > 1 && console.log('\t'.repeat(l - 1) + "%c" + n.name + " -> %c" + n.value + (n.isFixed ? ' [FIX]' : ''), n.value ? '' : 'color:#777;', n.value ? 'color:#f55;' : 'color:#777;');
            for (var i in n.children) {
                a(n.children[i], l + 1);
            }
            l === 1 && console.groupEnd();
        })(tree, 0);
    };
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
    Red.prototype.on = function (path, callback, context) {
        if (typeof callback === 'function') {
            if (!this._listeners[path]) {
                this._listeners[path] = [];
            }
            var key = (Math.random() * Math.pow(10, 10)).toFixed(0);
            this._listeners[path].push({ callback: callback, context: context, key: key });
            return key;
        }
        error("Listen (" + path + ") Failed: not a function");
        return '';
    };
    /**
     * 关闭监听
     * @param path 红点路径
     * @param key 红点监听钥匙（red.on返回）
     */
    Red.prototype.off = function (path, key) {
        if (!this._listeners[path]) {
            return;
        }
        var arr = this._listeners[path];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].key === key) {
                arr.splice(i, 1);
                break;
            }
        }
        if (arr.length === 0) {
            delete this._listeners[path];
        }
    };
    /**
     * 红点变化通知所有监听者
     * @param path 红点路径
     * @param value 值
     */
    Red.prototype._notifyAll = function (path, value) {
        if (!this._listeners[path]) {
            return;
        }
        var arr = this._listeners[path];
        for (var i = 0; i < arr.length; i++) {
            var _a = arr[i], callback = _a.callback, context = _a.context;
            callback.call(context || null, value);
        }
    };
    return Red;
}());
export default Red.getInstance();
/*
 _
| |
| |_ _ __ ___  ___
| __| '__/ _ \/ _ \
| |_| | |  __/  __/
 \__|_|  \___|\___|

*/
/** 红点结点 */
var RedNode = /** @class */ (function () {
    function RedNode(name, parent) {
        this.children = {};
        this.name = name;
        this.value = 0;
        this.isFixed = false;
        this.parent = parent !== null && parent !== void 0 ? parent : null;
    }
    /**
     * 添加子结点
     * @param path 红点路径
     * @param callback 红点set的回调，用于设置临时创建的结点
     */
    RedNode.prototype.addChild = function (path, callback) {
        if (path === '') {
            return false;
        }
        var keyNames = path.split(SPLITTER);
        var node = this;
        var len = keyNames.length, tmpPath = '';
        for (var i = 0; i < len - 1; i++) {
            var k = keyNames[i];
            tmpPath += k;
            if (node.children[k]) {
                node = node.children[k];
            }
            else {
                // across
                var newNode_1 = new RedNode(k, node);
                node.children[k] = newNode_1;
                node = newNode_1;
                callback === null || callback === void 0 ? void 0 : callback(tmpPath);
            }
            tmpPath += SPLITTER;
        }
        var leafKey = keyNames[len - 1];
        var newNode = new RedNode(leafKey, node);
        node.children[leafKey] = newNode;
        return true;
    };
    /**
     * 切换固定状态
     * 解除固定后自动更行自身值
     */
    RedNode.prototype.fixToggle = function () {
        var isFixed = this.isFixed = !this.isFixed;
        if (!isFixed) {
            var ret = RedNode._brotherhood(this);
            red.set(RedNode.getPath(this), ret);
        }
        return isFixed;
    };
    /**
     * 兄弟齐心，获取parent结点所有子辈的值总和
     * @param parent 目标父节点
     */
    RedNode._brotherhood = function (parent) {
        var total = 0;
        var children = parent.children;
        for (var i in children) {
            total += children[i].value;
        }
        return total;
    };
    /**
     * 执行更新
     * @param source 源结点
     * @param target 目标结点
     * @param value 值
     */
    RedNode.exec = function (source, target, value) {
        var node;
        if (typeof target === 'string') {
            var ret = source.find(target);
            if (ret === null) {
                return false;
            }
            node = ret;
        }
        else {
            node = target;
        }
        if (node.value === value) {
            return true;
        }
        node.value = value;
        var parent = node.parent;
        if (node && parent && parent.parent) {
            var ret = RedNode._brotherhood(parent);
            if (ret !== parent.value && !parent.isFixed) {
                var k = RedNode.getPath(parent);
                red.set(k, ret, {
                    node: parent
                });
            }
        }
        return true;
    };
    /**
     * 在目标节点下寻找子节点
     * @param path 路径
     */
    RedNode.prototype.find = function (path) {
        if (!path) {
            return this;
        }
        var nodeNames = path.split(SPLITTER);
        var node = this;
        for (var i = 0; i < nodeNames.length; i++) {
            var child = node.children[nodeNames[i]];
            if (!child) {
                error("Find (" + path + ") Failed");
                return null;
            }
            node = child;
        }
        return node;
    };
    /**
     * 获取结点完整的路径
     * @param node 结点
     */
    RedNode.getPath = function (node) {
        var names = [];
        while (node && node.parent) {
            names.push(node.name);
            node = node.parent;
        }
        var ret = names.reverse().join(SPLITTER);
        return ret;
    };
    return RedNode;
}());
var red = Red.getInstance();
var tree = new RedNode('root');
