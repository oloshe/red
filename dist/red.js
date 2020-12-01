import { log, warn, error } from "./log";
var SPLITTER = '/';
var Red = (function () {
    function Red() {
        this._listeners = {};
        this._initialPaths = [];
        this.map = {};
    }
    Red.getInstance = function () {
        if (!this.instance) {
            this.instance = new Red();
        }
        return this.instance;
    };
    Red.prototype.init = function (initialPaths) {
        var _this = this;
        this._initialPaths = initialPaths;
        initialPaths.forEach(function (path) {
            _this.map[path] = 0;
            tree.addChild(path);
        });
    };
    Red.prototype.set = function (path, value, options) {
        if (typeof value === 'boolean')
            value = Number(value);
        if (this.map[path] === value || this._checkMap(path, options === null || options === void 0 ? void 0 : options.force)) {
            return;
        }
        log("SET (" + path + ") = " + value);
        this.map[path] = value;
        RedNode.exec(tree, (options === null || options === void 0 ? void 0 : options.node) ? options.node : path, value);
        this._notifyAll(path, value);
    };
    Red.prototype.get = function (path) {
        var result = red.map[path];
        if (this._checkMap(path)) {
            return 0;
        }
        return result;
    };
    Red.prototype.del = function (path) {
        if (this.map[path] === void 0) {
            return false;
        }
        if (this._initialPaths.indexOf(path) !== -1) {
            warn("DEL (" + path + ") FAIL: can't delete Initialized path");
            return false;
        }
        var node = tree.find(path);
        if (!node) {
            return false;
        }
        RedNode.exec(tree, node, 0);
        delete this.map[path];
        node.parent && delete node.parent.children[node.name];
        log("DEL (" + path + ")");
        return true;
    };
    Red.prototype._checkMap = function (path, force) {
        var isVoid = this.map[path] === void 0;
        if (!isVoid) {
            return false;
        }
        if (force) {
            var ret = tree.addChild(path);
            if (!ret) {
                error("NEW (" + path + ") Failed");
            }
            return !ret;
        }
        warn("GET (" + path + ") Failed: please register: " + path);
        return true;
    };
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
export default Red;
var RedNode = (function () {
    function RedNode(name, parent) {
        this.children = {};
        this.name = name;
        this.value = 0;
        this.isFixed = false;
        this.parent = parent !== null && parent !== void 0 ? parent : null;
    }
    RedNode.prototype.addChild = function (path) {
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
                var newNode_1 = new RedNode(k, node);
                node.children[k] = newNode_1;
                node = newNode_1;
                red.map[tmpPath] = 0;
            }
            tmpPath += SPLITTER;
        }
        var leafKey = keyNames[len - 1];
        var newNode = new RedNode(leafKey, node);
        node.children[leafKey] = newNode;
        return true;
    };
    RedNode.prototype.fixToggle = function () {
        var isFixed = this.isFixed = !this.isFixed;
        if (!isFixed) {
            var ret = RedNode._brotherhood(this);
            red.set(RedNode.getPath(this), ret);
        }
        return isFixed;
    };
    RedNode._brotherhood = function (parent) {
        var total = 0;
        if (parent) {
            var children = parent.children;
            for (var i in children) {
                total += children[i].value;
            }
        }
        return total;
    };
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
