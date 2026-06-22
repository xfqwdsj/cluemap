---
name: creating-datasets
description: Use when creating or editing JSON datasets for ClueMap, including statements, connections, string sets, categories, and compound conditions
---

# Creating Datasets

## Overview

Datasets define the mathematical/logical relationships for visualization. Each statement has a unique ID, connections define relationships, string sets provide display text, and virtual nodes represent compound conditions.

## When to Use

- Creating new datasets from scratch
- Adding statements or connections to existing datasets
- Adding compound conditions (A+B→C) via virtual nodes
- Restructuring datasets for better visualization
- Converting external data to ClueMap format

## Dataset Structure

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Display name
  statements: Statement[]; // Nodes in the graph
  connections: Connection[]; // Edges between nodes
  stringSets?: StringSet[]; // Display text mappings
  categories?: Category[]; // Optional grouping
  virtualNodes?: VirtualNode[]; // Compound conditions
}
```

## Statements

Each statement expresses ONE property.

```json
{ "id": "inv", "category": "core" }
```

- `id`: Unique identifier, used in connections, stringSets, and virtualNodes
- `category`: Optional grouping for sidebar filtering

### Rules

1. **One property per statement**: Don't inline relationships
   ```json
   // ❌ BAD
   { "id": "a" } // text: "$A$ is invertible $\Leftrightarrow$ $\det(A) \neq 0$"
   
   // ✅ GOOD
   { "id": "inv" }   // text: "$A$ 可逆"
   { "id": "det-nz" } // text: "$\det(A) \neq 0$"
   ```

2. **Complementary pairs**: Include both directions
   ```json
   { "id": "rank-n" }    // "$\operatorname{rank}(A) = n$"
   { "id": "rank-lt-n" } // "$\operatorname{rank}(A) < n$"
   ```

3. **Use categories**: Group related statements

## Connections

Binary relationships between statements.

```json
{ "from": "inv", "to": "det-nz", "type": "equivalent" }
```

### Relationship Types

| Type | Meaning | Symbol | Direction |
|------|---------|--------|-----------|
| `implies` | A 推出 B | → | One-way |
| `inverse` | A 与 B 互斥 | ↔ | Mutual exclusion |
| `equivalent` | A 与 B 等价 | ⇔ | Two-way |
| `subset` | A 包含于 B | ⊂ | One-way |

### Rules

1. No duplicate connections
2. No self-loops (`from` ≠ `to`)
3. Both `from` and `to` must reference existing statements

```json
// equivalent: A ⇔ B
{ "from": "inv", "to": "det-nz", "type": "equivalent" }

// inverse: A ↔ B (mutually exclusive)
{ "from": "det-nz", "to": "det-z", "type": "inverse" }

// implies: A → B
{ "from": "inv", "to": "diag-pap", "type": "implies" }
```

## String Sets

Human-readable labels for statement IDs.

```json
{
  "name": "中文",
  "language": "zh",
  "entries": {
    "inv": "$A$ 可逆",
    "det-nz": "$\\det(A) \\neq 0$"
  }
}
```

### Rules

1. **LaTeX math**: Use `$...$` syntax for formulas
2. **Clean text**: No relationship symbols (→, ⇔) in text
3. **Consistent naming**: Every statement ID should have an entry

## Categories

Group statements for sidebar filtering.

```json
{ "id": "core", "name": "核心枢纽" }
```

## Virtual Nodes (Compound Conditions)

Represent compound sufficient conditions where multiple premises imply a target.

```json
{
  "id": "vn-sim-1",
  "type": "and",
  "premises": ["sim-charpoly", "sim-geom-mult"],
  "target": "sim-pap",
  "relationship": "implies"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID, prefix with `vn-` |
| `type` | `"and"` \| `"or"` | Yes | Logical operator |
| `premises` | string[] | Yes | Statement IDs (min 2) |
| `target` | string | Yes | Result statement ID |
| `relationship` | RelationshipType | Yes | Same as connections |

### Type Semantics

| Type | Formula | Meaning |
|------|---------|---------|
| `and` | A ∧ B → C | A 和 B 同时成立推出 C |
| `or` | A ∨ B → C | A 或 B 成立推出 C |

### Rules

1. **Minimum 2 premises**: `["A", "B"]` not `["A"]`
2. **No duplicate premises**: `["A", "A"]` is invalid
3. **All premises must exist**: Every ID must be in statements
4. **Target must exist**: Target ID must be in statements
5. **No self-reference**: Premise cannot equal target

### Example: Similar Matrix Conditions

```json
{
  "id": "vn-sim-1",
  "type": "and",
  "premises": ["sim-charpoly", "sim-geom-mult"],
  "target": "sim-pap",
  "relationship": "implies"
}
```

This means: 特征多项式相同 ∧ 几何重数相同 → A ∼ B（相似）

## UI/UX Behavior

### Graph View
- Statements → circles
- Virtual nodes → amber diamonds with ∧/∨ labels
- Premise → virtual node edges: dashed
- Virtual node → target edges: solid

### Tree View
- Virtual node cards show: `前提1 ∧ 前提2 → 目标`
- Highlighted premise (parent node) appears first
- Clickable premises navigate to statements

### Detail View
- "作为前提参与": compound outgoing (this statement is a premise)
- "由复合条件推出": compound incoming (this statement is the target)

## Validation

**Always run after editing:**
```bash
pnpm validate datasets/your-file.json
```

### Errors (must fix)
- Connection references non-existent statement
- Virtual node references non-existent premise/target
- Virtual node has < 2 premises
- Duplicate premises in virtual node

### Warnings (recommended to fix)
- Isolated nodes (no connections)
- Disconnected subgraphs
- Duplicate connections
- Self-loops
- Invalid category references
- Duplicate virtual node IDs

## Tree Debugging

**Debug tree structure for specific nodes:**
```bash
pnpm debug-tree datasets/your-file.json statement-id
pnpm debug-tree datasets/your-file.json statement-id1 statement-id2
```

Output shows tree hierarchy with virtual nodes (compound conditions) displayed as formulas. The tree building logic is shared between the application (`src/lib/tree-builder.ts`) and this script.

## Complete Example

```json
{
  "id": "linear-algebra",
  "name": "线性代数充要条件",
  "statements": [
    { "id": "inv", "category": "core" },
    { "id": "det-nz", "category": "det-rank" },
    { "id": "sim-pap", "category": "sim-cong" },
    { "id": "sim-charpoly", "category": "sim-cong" },
    { "id": "sim-geom-mult", "category": "sim-cong" }
  ],
  "connections": [
    { "from": "inv", "to": "det-nz", "type": "equivalent" },
    { "from": "sim-pap", "to": "sim-charpoly", "type": "implies" }
  ],
  "virtualNodes": [
    {
      "id": "vn-sim-1",
      "type": "and",
      "premises": ["sim-charpoly", "sim-geom-mult"],
      "target": "sim-pap",
      "relationship": "implies"
    }
  ],
  "stringSets": [{
    "name": "中文",
    "language": "zh",
    "entries": {
      "inv": "$A$ 可逆",
      "det-nz": "$\\det(A) \\neq 0$",
      "sim-pap": "$A \\sim B$（相似）",
      "sim-charpoly": "特征多项式相同",
      "sim-geom-mult": "各特征值几何重数相同"
    }
  }],
  "categories": [
    { "id": "core", "name": "核心枢纽" },
    { "id": "det-rank", "name": "行列式与秩" },
    { "id": "sim-cong", "name": "相似与合同" }
  ]
}
```

## Common Mistakes

1. **Inlining relationships in text** → Separate into statements + connections
2. **Missing complementary statements** → Add inverse/opposite
3. **Orphan connections** → Ensure both nodes exist
4. **Duplicate connections** → Check before adding
5. **Virtual node with 1 premise** → Minimum 2 premises required
6. **Not validating** → Always run `pnpm validate`
