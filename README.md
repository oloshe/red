# red-manager

基于树结构的红点通知管理模块。

## 特性

- 根据路径形构建红点树，形成红点间的的依赖关系
- 响应式更新，无需对每个结点计算，只需针对叶结点统计红点即可
- 监听红点变化，自定义红点表现方式，兼容所有框架
- 动态增加/删除结点，应对数量不可预计的情况

## 安装

```
npm install red-manager
```

## 用法

导入

```TypeScript
import Red from "red-manager"
const red = Red.getInstance()
```

初始化

```TypeScript
red.init([
  'index',
  'index/tab1',
  'index/tab2',
  'my'
])
```

## 总结

更多的待补充，日后继续更新......

测试代码写的很全了。

在真实项目中也有在用，请放心使用！


