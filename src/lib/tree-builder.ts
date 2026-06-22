import { DataSet, Connection, VirtualNode } from '@/types';

export interface TreeNode {
  id: string;
  connections: { node: TreeNode; connection: Connection }[];
  isVirtual?: boolean;
  virtualType?: 'and' | 'or';
  virtualNode?: VirtualNode;
  parentId?: string;
}

export function buildTree(dataset: DataSet, rootId: string): { tree: TreeNode | null; maxDepth: number } {
  const visited = new Set<string>();
  let maxDepth = 0;

  function makeRefNode(id: string): TreeNode {
    return { id, connections: [], isVirtual: false };
  }

  function buildVirtualNode(vn: VirtualNode, fromSide: 'premise' | 'target', parentId: string, depth: number): TreeNode {
    const children: { node: TreeNode; connection: Connection }[] = [];

    if (fromSide === 'target') {
      vn.premises.forEach((premiseId) => {
        const child = visited.has(premiseId) ? makeRefNode(premiseId) : build(premiseId, depth + 1);
        if (child) {
          children.push({
            node: child,
            connection: { from: premiseId, to: vn.id, type: vn.relationship },
          });
        }
      });
    } else {
      const targetNode = visited.has(vn.target) ? makeRefNode(vn.target) : build(vn.target, depth + 1);
      if (targetNode) {
        children.push({
          node: targetNode,
          connection: { from: vn.id, to: vn.target, type: vn.relationship },
        });
      }
    }

    return { id: vn.id, connections: children, isVirtual: true, virtualType: vn.type, virtualNode: vn, parentId };
  }

  function build(nodeId: string, depth: number): TreeNode | null {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);
    maxDepth = Math.max(maxDepth, depth);

    const connections: { node: TreeNode; connection: Connection }[] = [];

    dataset.connections
      .filter((c) => c.from === nodeId)
      .forEach((c) => {
        const child = build(c.to, depth + 1);
        if (child) connections.push({ node: child, connection: c });
      });

    dataset.connections
      .filter((c) => c.to === nodeId)
      .forEach((c) => {
        const child = build(c.from, depth + 1);
        if (child) connections.push({ node: child, connection: c });
      });

    if (dataset.virtualNodes) {
      dataset.virtualNodes
        .filter((vn) => vn.premises.includes(nodeId))
        .forEach((vn) => {
          const vnNode = buildVirtualNode(vn, 'premise', nodeId, depth + 1);
          connections.push({
            node: vnNode,
            connection: { from: nodeId, to: vn.id, type: vn.relationship },
          });
        });

      dataset.virtualNodes
        .filter((vn) => vn.target === nodeId)
        .forEach((vn) => {
          const vnNode = buildVirtualNode(vn, 'target', nodeId, depth + 1);
          connections.push({
            node: vnNode,
            connection: { from: vn.id, to: nodeId, type: vn.relationship },
          });
        });
    }

    const virtualNode = dataset.virtualNodes?.find((vn) => vn.id === nodeId);
    return {
      id: nodeId,
      connections,
      isVirtual: !!virtualNode,
      virtualType: virtualNode?.type,
      virtualNode,
    };
  }

  const tree = build(rootId, 0);
  return { tree, maxDepth };
}

export function printTree(node: TreeNode, stringSet: Record<string, string>, indent: string = '', isLast: boolean = true): string[] {
  const lines: string[] = [];
  const prefix = indent + (isLast ? '└── ' : '├── ');
  let label = stringSet[node.id] || node.id;

  if (node.isVirtual && node.virtualNode) {
    const vn = node.virtualNode;
    const op = vn.type === 'and' ? '∧' : '∨';
    const parentText = stringSet[node.parentId || ''] || node.parentId || '?';
    const targetText = stringSet[vn.target] || vn.target;

    const sorted = [...vn.premises];
    const pi = sorted.indexOf(node.parentId || '');
    if (pi > 0) { sorted.splice(pi, 1); sorted.unshift(node.parentId!); }

    const formula = sorted.map(p => stringSet[p] || p).join(` ${op} `) + ` → ${targetText}`;
    label = `[${op}] ${formula}  (父节点: ${parentText})`;
  }

  lines.push(`${prefix}${label}`);

  const childIndent = indent + (isLast ? '    ' : '│   ');
  node.connections.forEach(({ node: child }, i) => {
    lines.push(...printTree(child, stringSet, childIndent, i === node.connections.length - 1));
  });

  return lines;
}
