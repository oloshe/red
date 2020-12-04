# red-manager

基于树结构的红点通知管理模块。

## 特性

- 根据路径自动构建红点树，形成红点间的的依赖关系
- 响应式更新，无需计算每个结点，只需针对叶结点统计即可
- 监听红点变化，自定义红点表现方式，兼容所有框架
- 动态增加/删除结点，应对数量不可预计的情况

## 安装

```
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
(红点管理器的哲学时只设置叶结点的数据，中间结点全部由节点树的自动更新机制处理)

```TypeScript
const data = await /* 从服务器接收的数据 */
const num: number = /* 根据数据获取判断红点是否存在的数据 */
red.set('index/tab1', num)

// or
const haveRedDot: boolean = /* 用于判断红点存在的布尔类型数据 */
red.set('index/tab1', haveRedDot) // haveRedDot 会自动转换成 0 / 1
```

获取红点状态

```TypeScript
const num:number = red.get('index/tab1')
```


监听红点数据变化

```TypeScript
let key: string
key = red.on('index', (num: number) => {
  console.log('index - ' + num)
})

// 取消监听
red.off('index', key)
```

动态创建结点

```TypeScript
red.set('index/tab3', 1, { force: true })

// 跨越空结点动态创建 (index/tab4不存在)
red.set('index/tab4/temp', 1, { force: true })
```

> 动态创建适用场景：数量不确定的列表，例如聊天消息
>
> 不建议初始化时为了提高创建速度而只保留叶子结点，初始化时的数组将会防止被被删除。

删除动态创建的结点

```TypeScript
const ret: boolean = red.del('index/tab4')
```

> 删除index/tab4结点时，index/tab4/temp结点也被释放
>
> 删除结点时不会通知监听者，因为删除红点前通常也会把对应的组件给销毁了


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

## 总结

更多的待补充，日后继续更新......

测试代码写的很全了。

在真实项目中也有在用，请放心使用！


