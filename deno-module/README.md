# red

Red dot notification management module based on tree structure

基于树结构的红点通知管理模块。

## 特性

- 根据路径自动构建红点树，形成红点间的的依赖关系
- 响应式更新，无需计算每个结点，只需针对叶结点统计即可
- 监听红点变化，自定义红点表现方式，兼容所有框架
- 动态增加/删除结点，应对数量不可预计的情况

## 基础用法

导入

```TypeScript
import red from "https://deno.land/x/red@1.0/mod.ts"
```

初始化
（假设你的app有两个tab页，其中首页index里又有两个tab）

```TypeScript
red.init([
  'index',
  'index/tab1',
  'index/tab2',
  'my'
])
```

设置红点

```TypeScript
const data = await /* 从服务器接收的数据 */
const num: number = /* 根据数据获取判断红点是否存在的数据 */
red.set('index/tab1', num)

// or
const haveRedDot: boolean = /* 用于判断红点存在的布尔类型数据 */
red.set('index/tab1', haveRedDot) // haveRedDot 会自动转换成 0 / 1
```

> 红点管理器的哲学是 **只设置叶子结点的数据**，中间结点全部由结点树的自动更新机制处理
>
> 如果手动设置非叶子结点，会造成父结点与子结点数据不统一的现象。
>
> 而再次更新叶子结点时，会覆盖该结点的值。

监听红点数据变化

```TypeScript
let key: string
key = red.on('index', (num: number) => {
  console.log('index - ' + num)
})

// 取消监听
red.off('index', key)
```

## 调试

设置调试等级

```TypeScript
import { setDebugLevel } from "red-manager"
setDebugLevel(3);
```

四个调试等级

- **0**：无任何打印
- **1**：只打印error
- **2**：只打印error、warn
- **3**：打印error、warn、log

查看红点状态

```TypeScript
red.dump();
```

![截图](https://raw.githubusercontent.com/oloshe/red-manager/main/img/20201202141157.png)

## 二次封装

- 在项目中使用可以在应用初始化的时候注册所有已知的结点，既 `red.init`。
- 对于依赖后端返回的数据显示红点的，可以在网络请求统一的回调处理中封装一层数据监听，设置监听字段，根据业务逻辑调用 `red.set` 设置红点。
- 封装一个组件，组件根据红点数据可以自定义自己的显示方式。