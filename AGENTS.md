# ClueMap 项目指南

## 项目概述

ClueMap 是一个前端应用，用于可视化数学/逻辑推导关系链。用户可以上传 JSON 数据集，浏览、搜索陈述，并查看陈述之间的推导关系（如：从方阵 A 可逆可以得出一系列结果）。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **包管理**: pnpm (不要用 npm)
- **UI**: Tailwind CSS v4
- **状态管理**: Zustand
- **图表**: D3.js
- **数学渲染**: KaTeX
- **测试**: Vitest

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 校验数据集（必须指定路径）
pnpm validate datasets/linear-algebra.json
pnpm validate datasets/linear-algebra.json datasets/sample-data.json

# 调试树结构（必须指定数据集和节点ID）
pnpm debug-tree datasets/linear-algebra.json sim-pap
pnpm debug-tree datasets/linear-algebra.json sim-pap sim-charpoly inv
```

## 重要约定

### 包管理

- **必须使用 pnpm**，不要用 npm
- 安装依赖: `pnpm add <package>`
- 安装开发依赖: `pnpm add -D <package>`

### 代码风格

- 中文 UI 文本
- 使用 Tailwind CSS 样式
- 组件使用 `'use client'` 指令（需要客户端交互时）
- 状态管理使用 Zustand

### 数据集格式

数据集 JSON 结构:

```typescript
{
  id: string;              // 唯一标识
  name: string;            // 显示名称
  statements: Statement[]; // 语句节点
  connections: Connection[]; // 关系边
  stringSets?: StringSet[]; // 显示文本
  categories?: Category[]; // 分类分组
  virtualNodes?: VirtualNode[]; // 复合条件
}
```

数据集文件放在 `datasets/` 目录（已 git 忽略）。

### 复合条件 (VirtualNodes)

表示多个前提推出一个结论的复合充分条件:

```json
{
  "id": "vn-sim-1",
  "type": "and",
  "premises": ["A", "B"],
  "target": "C",
  "relationship": "implies"
}
```

- `type`: `and` (∧) 或 `or` (∨)
- `premises`: 前提语句 ID 数组（至少 2 个）
- `target`: 结论语句 ID
- 校验规则: 前提/目标必须存在、无重复前提、无自引用

详细文档见 `.agents/skills/creating-datasets/SKILL.md`

### 数据校验

- 校验逻辑在 `src/lib/validator.ts` (UI 和 CLI 共享)
- 运行 `pnpm validate` 校验所有数据集
- **每次修改数据集后都要运行校验**

### 组件开发

- GraphView 使用 D3.js，注意性能优化
- 数学公式使用 KaTeX (`$...$` 语法)
- 详情视图中关系按类型分组显示
- 侧边栏选择陈述时自动滚动

### 状态管理

- Zustand store 在 `src/lib/store.ts`
- 使用 `useStore((s) => s.xxx)` 选择器模式
- 函数引用不要放入 useEffect 依赖数组（会导致无限重建）

### 国际化

- 语言包在 `src/lib/i18n.ts`
- 内置中文语言包
- 支持上传自定义语言包

#### UI 字符串编写规范

**所有面向用户的文本必须通过 i18n 系统管理，禁止内联中文或独立字符串 map。**

1. 在 `src/lib/i18n.ts` 的 `LocaleMessages` 接口中添加新 key
2. 在 `zh` 常量中添加对应的中文翻译
3. 在组件中通过 `const t = useStore((s) => s.getLocaleMessages())` 获取，使用 `t.xxx` 引用

```typescript
// ✅ 正确
const t = useStore((s) => s.getLocaleMessages());
return <h3>{t.derivedFrom}</h3>;

// ❌ 错误 — 内联中文
return <h3>由此可推</h3>;

// ❌ 错误 — 独立字符串 map
const LABELS: Record<string, string> = { implies: '推出' };
```

例外：数据集中定义的文本（如陈述内容、字符串集）不属于 UI 字符串，不需要走 i18n。

## 校验规则

- 错误: 连接引用不存在的节点、虚拟节点引用不存在的前提/目标、虚拟节点前提少于2个、重复前提
- 警告: 孤立节点、不连通子图、重复连接、自环、无效分类引用、重复虚拟节点ID
- 不警告: 源节点/汇节点（在有向图中是正常的）
