# React-Grid-Layout 本地源码指南

此目录为React-Grid-Layout组件源码与示例工程，提供可拖拽、可缩放、响应式网格布局。完整属性和原项目说明保留在 [英文README](README.md)，本页补充本地开发入口和当前工程边界。

## 目录与模块

| 位置 | 职责 |
|---|---|
| `lib/ReactGridLayout.jsx` | 网格布局主体 |
| `lib/ResponsiveReactGridLayout.jsx` | 响应式布局 |
| `lib/GridItem.jsx` | 单项拖拽与尺寸交互 |
| `lib/components/WidthProvider.jsx` | 容器宽度适配 |
| `lib/utils.js`、`lib/calculateUtils.js` | 布局和坐标计算 |
| `test/examples/` | 演示场景源码 |
| `test/` | Jest及组件测试资源 |
| `Makefile` | 开发、构建、检查与发布编排 |

## 本地开发

使用yarn.lock对应环境安装依赖，并准备make。工程源码使用Flow与JSX，示例开发依赖React 16；未声明统一Node engines，不应照新版本文档推断所有API与构建行为。

```bash
yarn install --frozen-lockfile
yarn dev
```

开发配置监听4002端口，打开 `http://localhost:4002/index-dev.html`。入口是test/dev-hook.jsx，开发别名指向本地index-dev.js，便于调试源码。

## 构建与检查

```bash
yarn test
yarn lint
yarn build
```

test通过Makefile运行Jest覆盖率；lint包含Flow和ESLint；build清理并生成build和dist。build-example/view-example还会生成示例资源，执行前确认目标目录为可重建产物。

使用库时仍需按照英文README引入网格与可缩放样式，并为容器提供宽度。消费API以当前版本导出及props定义为准。

## 贡献与验证

修改布局算法时应检查拖拽、缩放、断点、静态元素、碰撞和外部拖入等相关用例。保留原仓库 [LICENSE](LICENSE)、作者说明和发布约定。

本轮只核对package.json、Makefile、源码与开发配置，没有安装依赖、启动示例或重跑测试。原README徽章、线上演示与发布状态没有在本轮联网验证。
