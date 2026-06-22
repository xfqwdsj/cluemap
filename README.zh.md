<div align="center">
  <a href="README.md">English</a> | <a href="#cluemap">中文</a>
</div>

---

# ClueMap

**可视化数学与逻辑推导关系链。** ClueMap 是一个前端应用，用于探索陈述、定理和命题之间的蕴含、等价及其他逻辑关系。

上传 JSON 数据集，交互式浏览陈述、追溯推导路径、查看复合条件 —— 一切通过直观的图形界面完成。

## 功能特性

- **图视图** — 基于 D3.js 的交互式力导向图。平移、缩放，探索陈述之间的连接关系。
- **树视图** — 层级推导树，展示结论如何从前提出发推导得出。
- **详情视图** — 选中陈述后，侧边面板按关系类型分组展示所有关联。
- **复合条件** — 支持与 (∧) 和或 (∨) 复合前提，以特殊节点形式可视化。
- **字符串集** — 为陈述提供多语言显示文本，支持运行时切换。
- **分类** — 将陈述组织为层级分类，支持跨分类筛选。
- **数据校验** — 内置校验器检查数据集完整性（孤立节点、重复连接、无效引用等）。
- **自定义语言包** — 上传自定义语言文件，切换界面语言。

## 技术栈

| 层 | 技术 |
|-------|-----------|
| 框架 | [Next.js](https://nextjs.org/) 16 (App Router) |
| 语言 | [TypeScript](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) v4 |
| 状态管理 | [Zustand](https://github.com/pmndrs/zustand) |
| 图表 | [D3.js](https://d3js.org/) |
| 数学渲染 | [KaTeX](https://katex.org/) |
| 测试 | [Vitest](https://vitest.dev/) |
| 包管理 | [pnpm](https://pnpm.io/) |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/installation)

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

## 使用指南

### 准备数据集

创建包含以下结构的 JSON 文件：

```typescript
{
  "id": "my-dataset",             // 唯一标识
  "name": "My Dataset",           // 显示名称
  "statements": [                 // 陈述节点
    { "id": "stmt-1", "category": "algebra" },
    { "id": "stmt-2" }
  ],
  "connections": [                // 关系边
    { "from": "stmt-1", "to": "stmt-2", "type": "implies" }
  ],
  "stringSets": [                 // 可选：显示文本
    { "name": "English", "language": "en", "entries": {
      "stmt-1": "Statement A",
      "stmt-2": "Statement B"
    }}
  ],
  "categories": [                 // 可选：分类分组
    { "id": "algebra", "name": "代数" }
  ],
  "virtualNodes": []              // 可选：复合条件
}
```

### 关系类型

| 类型 | 符号 | 含义 |
|------|--------|---------|
| `implies` | → | A 推出 B |
| `inverse` | ↔ | 互反 |
| `equivalent` | ⇔ | 等价 |
| `subset` | ⊂ | A 是 B 的子集 |

### 校验数据

```bash
pnpm validate datasets/my-dataset.json
```

### 调试推导树

```bash
pnpm debug-tree datasets/my-dataset.json stmt-id
```

## 项目结构

```
cluemap/
├── datasets/          # JSON 数据集文件（git 忽略）
├── scripts/           # CLI 工具（校验、调试）
├── src/
│   ├── app/           # Next.js App Router 页面
│   ├── components/    # React 组件
│   │   └── ui/        # 可复用 UI 基础组件
│   ├── hooks/         # 自定义 React Hooks
│   ├── lib/           # 核心逻辑（store、i18n、validator）
│   └── types/         # TypeScript 类型定义
├── docs/              # 设计文档和规范
└── public/            # 静态资源
```

## 贡献

1. Fork 本仓库
2. 创建功能分支
3. 提交修改
4. 运行 `pnpm test` 和 `pnpm lint`
5. 提交 Pull Request

## 许可证

[MIT](LICENSE.md)
