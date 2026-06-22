import { DataSet, RelationshipType } from '@/types';

const VALID_RELATIONSHIP_TYPES: RelationshipType[] = [
  'implies',
  'inverse',
  'equivalent',
  'subset'
];

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  connectionIndex?: number;
}

export function validateDataset(data: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!data || typeof data !== 'object') {
    issues.push({ type: 'error', message: '数据不是有效的 JSON 对象' });
    return issues;
  }

  const requiredFields = ['id', 'name', 'statements', 'connections'] as const;
  for (const field of requiredFields) {
    if (!(field in data)) {
      issues.push({ type: 'error', message: `缺少必需字段: ${field}` });
    }
  }

  if (!Array.isArray(data.statements)) {
    issues.push({ type: 'error', message: 'statements 必须是数组' });
    return issues;
  }
  if (!Array.isArray(data.connections)) {
    issues.push({ type: 'error', message: 'connections 必须是数组' });
    return issues;
  }
  if (data.stringSets && !Array.isArray(data.stringSets)) {
    issues.push({ type: 'error', message: 'stringSets 必须是数组' });
  }
  if (data.categories && !Array.isArray(data.categories)) {
    issues.push({ type: 'error', message: 'categories 必须是数组' });
  }
  if (data.virtualNodes && !Array.isArray(data.virtualNodes)) {
    issues.push({ type: 'error', message: 'virtualNodes 必须是数组' });
  }

  if (issues.some(i => i.type === 'error')) return issues;

  for (const conn of data.connections) {
    if (!conn.from || !conn.to || !conn.type) {
      issues.push({ type: 'error', message: '连接缺少 from、to 或 type 字段' });
      break;
    }
    if (!VALID_RELATIONSHIP_TYPES.includes(conn.type)) {
      issues.push({ type: 'error', message: `无效的连接类型: ${conn.type}` });
      break;
    }
  }

  if (data.stringSets) {
    for (const ss of data.stringSets) {
      if (!ss.name || !ss.language || !ss.entries) {
        issues.push({ type: 'error', message: 'stringSet 缺少必需字段' });
        break;
      }
      if (typeof ss.entries !== 'object') {
        issues.push({ type: 'error', message: 'stringSet.entries 必须是对象' });
        break;
      }
    }
  }

  if (data.virtualNodes) {
    for (const vn of data.virtualNodes) {
      if (!vn.id || !vn.type || !vn.premises || !vn.target || !vn.relationship) {
        issues.push({ type: 'error', message: '虚拟节点缺少必需字段' });
        break;
      }
      if (vn.type !== 'and' && vn.type !== 'or') {
        issues.push({ type: 'error', message: `虚拟节点类型无效: ${vn.type}` });
        break;
      }
      if (!Array.isArray(vn.premises) || vn.premises.length < 2) {
        issues.push({ type: 'error', message: `虚拟节点 ${vn.id} 至少需要 2 个前提` });
        break;
      }
      if (!VALID_RELATIONSHIP_TYPES.includes(vn.relationship)) {
        issues.push({ type: 'error', message: `虚拟节点关系类型无效: ${vn.relationship}` });
        break;
      }
    }
  }

  if (issues.some(i => i.type === 'error')) return issues;

  const dataset = data as DataSet;
  const nodeIds = new Set(dataset.statements.map((s) => s.id));

  dataset.connections.forEach((conn, i) => {
    if (!nodeIds.has(conn.from)) {
      issues.push({ type: 'error', message: `连接引用了不存在的节点: ${conn.from}`, connectionIndex: i });
    }
    if (!nodeIds.has(conn.to)) {
      issues.push({ type: 'error', message: `连接引用了不存在的节点: ${conn.to}`, connectionIndex: i });
    }
  });

  const connSet = new Set<string>();
  dataset.connections.forEach((conn, i) => {
    const key = `${conn.from}->${conn.to}:${conn.type}`;
    if (connSet.has(key)) {
      issues.push({ type: 'warning', message: `重复的连接: ${conn.from} -> ${conn.to} (${conn.type})`, connectionIndex: i });
    }
    connSet.add(key);
  });

  dataset.connections.forEach((conn, i) => {
    if (conn.from === conn.to) {
      issues.push({ type: 'warning', message: `自环连接: ${conn.from}`, connectionIndex: i });
    }
  });

  const virtualEdges: Array<[string, string]> = [];
  if (dataset.virtualNodes) {
    dataset.virtualNodes.forEach((vn) => {
      vn.premises.forEach((premiseId) => {
        virtualEdges.push([premiseId, vn.target]);
      });
    });
  }

  function hasAnyConnection(nodeId: string): boolean {
    if (dataset.connections.some((c) => c.from === nodeId || c.to === nodeId)) return true;
    return virtualEdges.some(([a, b]) => a === nodeId || b === nodeId);
  }

  const visited = new Set<string>();
  const components: string[][] = [];

  function dfs(nodeId: string, component: string[]) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    component.push(nodeId);
    dataset.connections.forEach((conn) => {
      if (conn.from === nodeId) dfs(conn.to, component);
      if (conn.to === nodeId) dfs(conn.from, component);
    });
    virtualEdges.forEach(([a, b]) => {
      if (a === nodeId) dfs(b, component);
      if (b === nodeId) dfs(a, component);
    });
  }

  dataset.statements.forEach((stmt) => {
    if (!visited.has(stmt.id)) {
      const component: string[] = [];
      dfs(stmt.id, component);
      components.push(component);
    }
  });

  dataset.statements.forEach((stmt) => {
    if (!hasAnyConnection(stmt.id)) {
      issues.push({ type: 'warning', message: `孤立节点（无任何连接）: ${stmt.id}`, nodeId: stmt.id });
    }
  });

  const nonTrivialComponents = components.filter((comp) => comp.length > 1);
  if (nonTrivialComponents.length > 1) {
    nonTrivialComponents.forEach((comp, i) => {
      issues.push({ type: 'warning', message: `不连通的子图 #${i + 1}（${comp.length} 个节点）: ${comp.join(', ')}` });
    });
  }

  if (dataset.categories) {
    const categoryIds = new Set(dataset.categories.map((c) => c.id));
    dataset.statements.forEach((stmt) => {
      if (stmt.category && !categoryIds.has(stmt.category)) {
        issues.push({ type: 'warning', message: `陈述引用了不存在的分类: ${stmt.category} (节点: ${stmt.id})`, nodeId: stmt.id });
      }
    });
  }

  if (dataset.virtualNodes) {
    const vnIds = new Set<string>();
    dataset.virtualNodes.forEach((vn) => {
      if (vnIds.has(vn.id)) {
        issues.push({ type: 'warning', message: `重复的虚拟节点 ID: ${vn.id}` });
      }
      vnIds.add(vn.id);
      vn.premises.forEach((premiseId) => {
        if (!nodeIds.has(premiseId)) {
          issues.push({ type: 'error', message: `虚拟节点引用了不存在的节点: ${premiseId}` });
        }
      });
      if (!nodeIds.has(vn.target)) {
        issues.push({ type: 'error', message: `虚拟节点引用了不存在的节点: ${vn.target}` });
      }
      const premiseSet = new Set(vn.premises);
      if (premiseSet.size !== vn.premises.length) {
        issues.push({ type: 'error', message: `虚拟节点 ${vn.id} 有重复的前提节点` });
      }
      if (vn.premises.includes(vn.target)) {
        issues.push({ type: 'warning', message: `虚拟节点 ${vn.id} 的前提包含目标节点` });
      }
    });
  }

  return issues;
}
