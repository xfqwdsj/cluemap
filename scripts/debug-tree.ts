#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { DataSet } from '../src/types';
import { buildTree, printTree } from '../src/lib/tree-builder';

function formatReport(dataset: DataSet, trees: { rootId: string; lines: string[] }[]): string {
  const lines: string[] = [];
  lines.push(`# 树结构调试报告 - ${dataset.name}`);
  lines.push(`# 生成时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('');

  lines.push('## 数据集摘要');
  lines.push(`- 节点数: ${dataset.statements.length}`);
  lines.push(`- 连接数: ${dataset.connections.length}`);
  lines.push(`- 虚拟节点数: ${dataset.virtualNodes?.length || 0}`);
  lines.push('');

  for (const tree of trees) {
    const stmt = dataset.statements.find(s => s.id === tree.rootId);
    const label = dataset.stringSets[0]?.entries?.[tree.rootId] || tree.rootId;
    lines.push(`## 树: ${label} (${tree.rootId})`);
    if (stmt?.category) {
      const cat = dataset.categories?.find(c => c.id === stmt.category);
      lines.push(`- 分类: ${cat?.name || stmt.category}`);
    }
    lines.push('');
    lines.push(...tree.lines);
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('用法: pnpm debug-tree <dataset.json> <statement-id> [statement-id2 ...]');
    console.error('示例: pnpm debug-tree datasets/linear-algebra.json sim-pap');
    console.error('      pnpm debug-tree datasets/linear-algebra.json sim-pap sim-charpoly inv');
    process.exit(1);
  }

  const filePath = args[0];
  const rootIds = args.slice(1);
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`✗ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  let dataset: DataSet;
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    dataset = JSON.parse(content);
  } catch (e) {
    console.error(`✗ 解析失败: ${filePath}`);
    console.error(`  ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const stringSet = dataset.stringSets[0]?.entries || {};
  const trees: { rootId: string; lines: string[] }[] = [];

  for (const rootId of rootIds) {
    const stmt = dataset.statements.find(s => s.id === rootId);
    if (!stmt) {
      console.error(`⚠ 节点不存在: ${rootId}`);
      continue;
    }

    const { tree } = buildTree(dataset, rootId);
    if (!tree) {
      console.error(`⚠ 无法构建树: ${rootId}`);
      continue;
    }

    const treeLines = printTree(tree, stringSet);
    trees.push({ rootId, lines: treeLines });
  }

  if (trees.length === 0) {
    console.error('✗ 没有有效的节点可构建树');
    process.exit(1);
  }

  console.log(formatReport(dataset, trees));
}

main();
