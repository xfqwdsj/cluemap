#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { validateDataset, ValidationIssue } from '../src/lib/validator';
import { DataSet } from '../src/types';

function formatReport(dataset: DataSet, issues: ValidationIssue[]): string {
  const lines: string[] = [];
  lines.push(`# 数据校验报告 - ${dataset.name}`);
  lines.push(`# 生成时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('');

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  if (errors.length > 0) {
    lines.push(`## 错误 (${errors.length})`);
    errors.forEach((issue) => {
      lines.push(`- [ERROR] ${issue.message}`);
    });
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(`## 警告 (${warnings.length})`);
    warnings.forEach((issue) => {
      lines.push(`- [WARN] ${issue.message}`);
    });
    lines.push('');
  }

  if (issues.length === 0) {
    lines.push('## 校验通过');
    lines.push('未发现任何问题。');
    lines.push('');
  }

  lines.push('## 数据集摘要');
  lines.push(`- 节点数: ${dataset.statements.length}`);
  lines.push(`- 连接数: ${dataset.connections.length}`);
  lines.push(`- 虚拟节点数: ${dataset.virtualNodes?.length || 0}`);
  lines.push(`- 字符串集: ${dataset.stringSets.length}`);
  lines.push(`- 分类数: ${dataset.categories?.length || 0}`);

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: pnpm validate <file1.json> [file2.json ...]');
    console.error('示例: pnpm validate datasets/linear-algebra.json');
    console.error('      pnpm validate datasets/linear-algebra.json datasets/sample-data.json');
    process.exit(1);
  }

  let hasErrors = false;

  for (const filePath of args) {
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`✗ 文件不存在: ${filePath}`);
      hasErrors = true;
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);

      // Comprehensive validation (includes structural checks)
      const dataset: DataSet = data;
      const issues = validateDataset(dataset);

      const errors = issues.filter((i) => i.type === 'error');
      if (errors.length > 0) {
        hasErrors = true;
      }

      console.log(formatReport(dataset, issues));
      console.log('');
    } catch (e) {
      console.error(`✗ 解析失败: ${filePath}`);
      console.error(`  ${e instanceof Error ? e.message : String(e)}`);
      hasErrors = true;
    }
  }

  process.exit(hasErrors ? 1 : 0);
}

main();
