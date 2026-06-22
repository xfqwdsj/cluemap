import * as d3 from 'd3';
import { DataSet } from '@/types';

export interface GraphNode {
  id: string;
  label: string;
  isVirtual?: boolean;
  virtualType?: 'and' | 'or';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  isDashed?: boolean;
}

export function prepareGraphData(
  dataset: DataSet,
  stringSet: Record<string, string> | null
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = dataset.statements.map((s) => ({
    id: s.id,
    label: stringSet?.[s.id] || s.id,
  }));

  const links: GraphLink[] = dataset.connections.map((c) => ({
    source: c.from,
    target: c.to,
    type: c.type
  }));

  if (dataset.virtualNodes) {
    for (const vn of dataset.virtualNodes) {
      nodes.push({
        id: vn.id,
        label: vn.type === 'and' ? '∧' : '∨',
        isVirtual: true,
        virtualType: vn.type,
      });

      for (const premiseId of vn.premises) {
        links.push({
          source: premiseId,
          target: vn.id,
          type: vn.relationship,
          isDashed: true,
        });
      }

      links.push({
        source: vn.id,
        target: vn.target,
        type: vn.relationship,
      });
    }
  }

  return { nodes, links };
}

export function createSimulation(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number
) {
  return d3.forceSimulation<GraphNode>(nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(180))
    .force('charge', d3.forceManyBody().strength(-600))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(80));
}

export const RELATIONSHIP_COLORS: Record<string, string> = {
  implies: '#3B82F6',
  inverse: '#EF4444',
  equivalent: '#10B981',
  subset: '#8B5CF6'
};
