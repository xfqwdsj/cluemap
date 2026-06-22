<div align="center">
  <a href="#cluemap">English</a> | <a href="README.zh.md">中文</a>
</div>

---

# ClueMap

**Visualize mathematical and logical derivation chains.** ClueMap is a frontend application for exploring how statements, theorems, and propositions relate through implication, equivalence, and other logical relationships.

Upload a JSON dataset and interactively browse statements, trace derivation paths, and inspect compound conditions — all through an intuitive graph-based interface.

## Features

- **Graph View** — Interactive force-directed graph rendered with D3.js. Pan, zoom, and explore connections between statements.
- **Tree View** — Hierarchical derivation tree showing how a conclusion is reached from its premises.
- **Detail View** — Side panel showing all relationships for a selected statement, grouped by relationship type.
- **Compound Conditions** — Support for `and` (∧) and `or` (∨) compound premises visualized as special nodes.
- **String Sets** — Multi-language display text for statements, with runtime switching.
- **Categories** — Organize statements into hierarchical categories with cross-category filtering.
- **Data Validation** — Built-in validator to check dataset integrity (orphan nodes, duplicate connections, invalid references, etc.).
- **Custom Language Packs** — Upload custom locale files to switch the UI language.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Graph | [D3.js](https://d3js.org/) |
| Math | [KaTeX](https://katex.org/) |
| Test | [Vitest](https://vitest.dev/) |
| Package | [pnpm](https://pnpm.io/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/installation)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Usage

### Prepare a Dataset

Create a JSON file with the following structure:

```typescript
{
  "id": "my-dataset",             // unique identifier
  "name": "My Dataset",           // display name
  "statements": [                 // statement nodes
    { "id": "stmt-1", "category": "algebra" },
    { "id": "stmt-2" }
  ],
  "connections": [                // relationship edges
    { "from": "stmt-1", "to": "stmt-2", "type": "implies" }
  ],
  "stringSets": [                 // optional: display texts
    { "name": "English", "language": "en", "entries": {
      "stmt-1": "Statement A",
      "stmt-2": "Statement B"
    }}
  ],
  "categories": [                 // optional: groupings
    { "id": "algebra", "name": "Algebra" }
  ],
  "virtualNodes": []              // optional: compound conditions
}
```

### Relationship Types

| Type | Symbol | Meaning |
|------|--------|---------|
| `implies` | → | A implies B |
| `inverse` | ↔ | Mutually exclusive |
| `equivalent` | ⇔ | Logically equivalent |
| `subset` | ⊂ | A is a subset of B |

### Validate

```bash
pnpm validate datasets/my-dataset.json
```

### Debug Derivation Trees

```bash
pnpm debug-tree datasets/my-dataset.json stmt-id
```

## Project Structure

```
cluemap/
├── datasets/          # JSON dataset files (gitignored)
├── scripts/           # CLI utilities (validate, debug-tree)
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   └── ui/        # Reusable UI primitives
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Core logic (store, i18n, validator)
│   └── types/         # TypeScript type definitions
├── docs/              # Design specs and documentation
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm test` and `pnpm lint`
5. Submit a pull request

## License

[MIT](LICENSE.md)
