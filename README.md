# red-manager

基于树结构的红点通知管理模块。

## 特性

- 根据路径自动构建红点树，形成红点间的的依赖关系
- 响应式更新，无需计算每个结点，只需针对叶结点统计即可
- 监听红点变化，自定义红点表现方式，兼容所有框架
- 动态增加/删除结点，应对数量不可预计的情况

## 安装

```cmd
npm install red-manager
```

## 基础用法

导入

```TypeScript
import red from "red-manager"
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
let listen = red.on('index', (num: number) => {
  console.log('index - ' + num)
})

// 取消监听
listen.off()
```

查看红点状态

```TypeScript
red.dump();
```

![截图](https://raw.githubusercontent.com/oloshe/red-manager/main/img/20201202141157.png)

## Api

初始化红点树

`init(initialPathArr: string[])`


设置红点状态

`set(path: string, value: boolean | number, options: SetOption = {})`

获取红点路径的值

`get(path: string, unionKey?: string): number`

删除动态红点

`del(path: string): boolean`

设置红点状态 **此时可以设置非叶子结点的状态**

`unsafe.set(path: string, value: boolean | number, options: SetOption = {})`

删除任意一个红点

`unsafe.del(path: string): boolean`

监听 路径的红点如果值发生了变化会调用 callback

```
on(path: string, options: {
  callback: (num: number) => void,
  context?: any
  unionKey?: string,
}): { off: () => void }
```

取消监听 （也可以用 `red.on` 的返回值来取消监听）

`off(path: string, key: Symbol)`

清理该路径上的红点，包括他的所有子结点

`clear(path: string)`

调试查看

`dump()`

## 二次封装

- 在项目中使用可以在应用初始化的时候注册所有已知的结点，既 `red.init`。
- 对于依赖后端返回的数据显示红点的，可以在网络请求统一的回调处理中封装一层数据监听，设置监听字段，根据业务逻辑调用 `red.set` 设置红点。
- 封装一个组件，组件根据红点数据可以自定义自己的显示方式。

## 测试

本模块测试覆盖率超过96%，正常使用没有任何问题。

测试代码写的很全了，可以当demo来看。

## 总结

更多的待补充，日后继续更新......

在真实项目中也有在用，请放心使用！
