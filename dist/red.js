var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var log = console.log.bind(console, '🔴 ');
var error = console.error.bind(console, '🔴 ');
var warn = console.warn.bind(console, '🔴 ');
var splitter = "/";
var RedNode = /** @class */ (function () {
    function RedNode(name, parent, lineage) {
        /** 财产 */
        this._value = 0;
        /** 固定（暂时没用上所以不写相关逻辑） */
        this.fixed = false;
        /** 后代 */
        this.children = {};
        this.name = name, this.parent = parent;
        if (lineage != void 0) {
            this.lineage = lineage;
            return;
        }
        // 历代血脉
        this.lineage = __spread(this).map(function (x) { return x.name; })
            .reverse()
            .join(splitter);
    }
    /**
     * 自身迭代器，从自己到祖先 (不包括 root)
     */
    RedNode.prototype[Symbol.iterator] = function () {
        var dynasties;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dynasties = this;
                    _a.label = 1;
                case 1:
                    if (!(dynasties && dynasties.parent)) return [3 /*break*/, 3];
                    return [4 /*yield*/, dynasties];
                case 2:
                    _a.sent();
                    dynasties = dynasties.parent;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    /** 添加孩子 */
    RedNode.prototype.addChild = function (path) {
        if (path === "")
            return null;
        var keyNames = path.split(splitter);
        var node = this;
        var len = keyNames.length, tmpPath = "";
        // 从第0个开始到倒数第2个
        for (var i = 0; i < len - 1; i++) {
            var k = keyNames[i];
            // 如果该字符串为空字符串时，会直接跳过。
            if (!k) {
                continue;
            }
            tmpPath += k;
            if (node.children[k]) {
                node = node.children[k];
            }
            else {
                // 中间存在不存在的结点的时候可以自动为其添加结点。
                var newNode_1 = new RedNode(k, node);
                node.children[k] = newNode_1;
                node = newNode_1;
            }
            tmpPath += splitter;
        }
        var leafKey = keyNames[len - 1];
        var newNode = new RedNode(leafKey, node, path);
        node.children[leafKey] = newNode;
        return newNode;
    };
    /** 在该结点上找到一个结点 */
    RedNode.find = function (node, path, options) {
        if (options === void 0) { options = {}; }
        if (!path)
            return node;
        var nodeNames = path.split(splitter);
        var target = node;
        for (var i = 0; i < nodeNames.length; i++) {
            var name_1 = nodeNames[i];
            var child = target.children[name_1];
            if (!child) {
                // 动态新增红点
                if (options.insertWhenNull) {
                    child = new RedNode(name_1, target);
                    target.children[name_1] = child;
                }
                else {
                    !options.careless && error("\u67E5\u627E\u8DEF\u5F84\uFF1A" + path + " \u5931\u8D25\uFF01\n\u539F\u56E0\uFF1A\u4E0D\u5B58\u5728\u8BE5\u7EA2\u70B9\u3002\n\u8BF7\u786E\u4FDD InitialPathArr \u4E2D\u5305\u542B\u8BE5\u8DEF\u5F84\uFF0C\u6216\u8005\u8BE5\u8DEF\u5F84\u5DF2\u7ECF\u6DFB\u52A0\u4E3A\u52A8\u6001\u7ED3\u70B9\u3002", node.lineage);
                    return null;
                }
            }
            target = child;
        }
        return target;
    };
    Object.defineProperty(RedNode.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (newValue) {
            if (newValue < 0) {
                newValue = 0;
            }
            // 相同值直接 return
            if (newValue == this._value)
                return;
            var delta = newValue - this._value;
            this._value += delta;
            log("SET (" + this.lineage + ") = " + newValue);
            red._notifyAll(this.lineage, newValue);
            if (this.parent && this.parent.parent) {
                this.parent.value += delta;
            }
        },
        enumerable: false,
        configurable: true
    });
    /** 忽略红点 深度优先遍历忽略所有子孙后代 */
    RedNode.prototype.ignore = function () {
        if (this.isLeftNode) {
            this.value = 0;
        }
        else {
            for (var i in this.children) {
                this.children[i].ignore();
            }
        }
    };
    Object.defineProperty(RedNode.prototype, "isLeftNode", {
        /** 是否是叶子结点 */
        get: function () {
            return Object.keys(this.children).length === 0;
        },
        enumerable: false,
        configurable: true
    });
    /** 红点树 根结点 */
    RedNode.root = new RedNode("@root", null);
    return RedNode;
}());
var red = /** @class */ (function () {
    function red() {
    }
    /** 初始化红点树 */
    red.init = function (initialPathArr) {
        red._initial_path_arr = initialPathArr;
        var len = initialPathArr.length;
        for (var i = 0; i < len; i++) {
            var path = initialPathArr[i];
            RedNode.root.addChild(path);
        }
    };
    /**
     * 判断路径时候能找到结点
     * @param path 路径
     * @param force 若为 true ，则不存在时自动添加结点
     * @returns
     */
    red.resolvePath = function (path, options) {
        if (options === void 0) { options = {}; }
        if (path == '')
            return null;
        var ret = RedNode.find(RedNode.root, path, {
            insertWhenNull: !!options.force,
            careless: !!options.careless,
        });
        if (ret) {
            return ret;
        }
        else {
            return null;
        }
    };
    /**
     * 设置红点状态
     * @param path 路径
     * @param value 值
     * @param options 可选参数
     * @returns
     */
    red.set = function (path, value, options) {
        if (options === void 0) { options = {}; }
        if (typeof value === "boolean")
            value = Number(value);
        if (typeof value !== 'number') {
            warn("red.set('" + path + "', " + value + ") \u8B66\u544A\uFF01\n\u7C7B\u578B\u9700\u8981\u4E3A boolean \u6216\u8005 number\uFF0C\u5374\u6536\u5230\u4E86 " + typeof value + " \u7C7B\u578B\u3002\u4F7F\u7528\u9ED8\u8BA4\u503C\uFF1A0");
            value = 0;
        }
        var symbol = options.symbol, force = options.force;
        var node = red.resolvePath(path, { force: force, careless: false });
        if (!node) {
            error("red.set('" + path + "', " + value + ") \u5931\u8D25! \n\u539F\u56E0\uFF1A\u8DEF\u5F84\u4E0D\u5B58\u5728 \n\u82E5\u8981\u6DFB\u52A0\u52A8\u6001\u7ED3\u70B9\u8BF7\u8BBE\u7F6E force \u4E3A true\uFF01\noptions:", options);
            return;
        }
        if (symbol) {
            var state = red.unionMap[path];
            if (!state) {
                state = new Map();
                red.unionMap[path] = state;
            }
            if (typeof state.get(symbol) != void 0) {
                state.set(symbol, value);
                log(symbol + " => " + value);
            }
            var num_1 = 0;
            state.forEach(function (v) { return num_1 += v; });
            value = num_1;
        }
        if (!node.isLeftNode) {
            if (!red._non_leaf_node_change_lock_) {
                log('修改非叶子结点');
            }
            else {
                error("red.set('" + path + "', " + value + ") \u5931\u8D25!\n\u539F\u56E0\uFF1A\u6B63\u5728\u8BBE\u7F6E\u975E\u53F6\u5B50\u7ED3\u70B9\u7684\u503C\uFF0C\u8FD9\u5C06\u4F1A\u9020\u6210\u7236\u5B50\u5143\u7D20\u4E0D\u540C\u6B65\uFF01\n\u8BF7\u5C3D\u91CF\u907F\u514D\u8FD9\u4E48\u5E72\uFF01\n\u5982\u679C\u4E0D\u5F97\u4E0D\u4FEE\u6539\u8BF7\u4F7F\u7528 red.unsafe.set \u65B9\u6CD5\u6765\u8BBE\u7F6E\u3002", node);
                return;
            }
        }
        node.value = value;
    };
    /**
     * 获取红点路径的值
     * @param path
     * @param unionKey
     * @returns
     */
    red.get = function (path, unionKey) {
        if (!unionKey) {
            var node = red.resolvePath(path, { careless: true });
            if (node) {
                return node.value;
            }
            else {
                return 0;
            }
        }
        else {
            var map = red.unionMap[path];
            if (map != void 0) {
                var ret = map.get(unionKey);
                if (ret !== void 0) {
                    return ret;
                }
                else {
                    warn("\u552F\u4E00\u503C\u4E0D\u5B58\u5728", path, unionKey);
                    return 0;
                }
            }
            else {
                warn("\u8DEF\u5F84\u5BF9\u8C61\u4E0D\u5B58\u5728", path, unionKey);
                return 0;
            }
        }
    };
    /**
     * 删除一个动态红点
     * 会释放红点树和监听者占用的内存，此时监听函数将不会生效
     * @param path
     */
    red.del = function (path) {
        var _a;
        if (!path)
            return false;
        // 在初始化的红点中，默认不能删除，请使用 red.unsafe.del 删除
        if (((_a = red._initial_path_arr) === null || _a === void 0 ? void 0 : _a.indexOf(path)) != -1) {
            error("\u5220\u9664\u7EA2\u70B9 " + path + " \u5931\u8D25\uFF01\n\u539F\u56E0\uFF1A\u8BE5\u8DEF\u5F84\u5728\u521D\u59CB\u5316\u7EA2\u70B9\uFF0C\u9ED8\u8BA4\u4E0D\u80FD\u5220\u9664\uFF0C\u8BF7\u4F7F\u7528 red.unsafe.del \u5220\u9664\u3002");
            return false;
        }
        return red.unsafe.del(path);
    };
    /**
     * 监听 路径的红点如果值发生了变化会调用 callback
     * @param path
     * @param options
     * @returns
     */
    red.on = function (path, options) {
        var unionKey = options.unionKey, context = options.context, callback = options.callback;
        var key;
        if (typeof callback === "function") {
            if (!red.listeners[path])
                red.listeners[path] = [];
            // @ts-ignore
            key = Symbol();
            red.listeners[path].push({ callback: callback, context: context, unionKey: unionKey, key: key });
        }
        else {
            error("Listen (" + path + ") Failed: not a function");
        }
        return { off: function () { return red.off(path, key); } };
    };
    red.clear = function (path) {
        var node = RedNode.find(RedNode.root, path);
        if (node) {
            node.ignore();
        }
    };
    /**
     * 取消监听红点
     * @param path
     * @param key
     * @returns
     */
    red.off = function (path, key) {
        if (!red.listeners[path] || !key)
            return;
        var arr = red.listeners[path];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].key === key) {
                arr.splice(i, 1);
                break;
            }
        }
        if (arr.length === 0) {
            delete red.listeners[path];
        }
    };
    /** 通知所有该路径上的监听者，值发生了变化，然后把值传递给对应的回调函数  */
    red._notifyAll = function (path, value) {
        if (!red.listeners[path])
            return;
        var arr = red.listeners[path];
        for (var i = 0; i < arr.length; i++) {
            var _a = arr[i], callback = _a.callback, context = _a.context, unionKey = _a.unionKey;
            if (!unionKey) {
                callback.call(context || null, value);
            }
            else {
                callback.call(context || null, red.get(path, unionKey));
            }
        }
    };
    /** 调试用 */
    red.dump = function () {
        log("监听者", red.listeners);
        log("联合状态", red.unionMap);
        log("状态树:", RedNode.root);
        (function a(n, l) {
            var g = n.name + " (" + n.value + ")";
            // @ts-ignore
            l === 1 && console.groupCollapsed(g);
            l > 1 && console.log("\t".repeat(l - 1) + "%c" + n.name + " -> %c" + n.value + (n.fixed ? " [FIX]" : ""), n.value ? "" : "color:#777;", n.value ? "color:#f55;" : "color:#777;");
            for (var i in n.children) {
                a(n.children[i], l + 1);
            }
            // @ts-ignore
            l === 1 && console.groupEnd(g);
        })(RedNode.root, 0);
    };
    /** 红点变化监听者 */
    red.listeners = {};
    /** 联合状态字典 */
    red.unionMap = {};
    red.unsafe = {
        /**
         * 设置红点状态
         *
         * **此时可以设置非叶子结点的状态**
         * @param path
         * @param value
         * @param options
         */
        set: function (path, value, options) {
            if (options === void 0) { options = {}; }
            red._non_leaf_node_change_lock_ = false;
            red.set(path, value, options);
            red._non_leaf_node_change_lock_ = true;
        },
        /**
         * 删除任意一个红点
         * 会释放红点树和监听者占用的内存，此时监听函数将不会生效
         * @param path
         */
        del: function (path) {
            var del_node = red.resolvePath(path);
            if (del_node) {
                // 删除结点 触发连锁更新
                var del_path = del_node.lineage;
                red.unsafe.set(del_path, 0);
                // dfs 检查子结点
                var check_it_out_1 = function (node) {
                    var _a;
                    // 监听是否存在
                    var path = node.lineage;
                    console.log(path);
                    var arr = red.listeners[path];
                    if (arr && arr.length) {
                        warn("\u5220\u9664\u7EA2\u70B9\uFF1A" + node.lineage);
                        delete red.listeners[path];
                    }
                    // 删除结点
                    (_a = node.parent) === null || _a === void 0 ? true : delete _a.children[node.name];
                    if (!node.isLeftNode) {
                        // 删除非叶子结点需要把所有 children 干掉
                        for (var i in node.children) {
                            check_it_out_1(node.children[i]);
                        }
                    }
                };
                check_it_out_1(del_node);
                return true;
            }
            return false;
        }
    };
    /** 防止非叶子结点被修改的锁, true => 不允许修改 false => 允许修改 */
    red._non_leaf_node_change_lock_ = true;
    return red;
}());
// module.exports = red;
export default red;
