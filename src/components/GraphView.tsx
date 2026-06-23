'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import katex from 'katex';
import { useStore } from '@/lib/store';
import { prepareGraphData, createSimulation, RELATIONSHIP_COLORS, DEFAULT_FORCE_PARAMS } from '@/lib/graph-utils';
import { GraphNode, GraphLink, ForceParams } from '@/lib/graph-utils';
import { ForceControlPanel } from './ForceControlPanel';

const LABEL_WIDTH = 120;
const LABEL_HEIGHT = 36;

function renderKatex(text: string): string {
  return text.replace(/\$([^$]+)\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<span style="color: #cc0000">${latex}</span>`;
    }
  });
}

function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

interface GraphViewProps {
  isVisible: boolean;
}

export function GraphView({ isVisible }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const nodeSelectionRef = useRef<d3.Selection<SVGCircleElement, GraphNode, SVGGElement, unknown> | null>(null);
  const virtualNodeSelectionRef = useRef<d3.Selection<SVGPolygonElement, GraphNode, SVGGElement, unknown> | null>(null);
  const builtRef = useRef(false);
  const selectStatementRef = useRef<((id: string | null) => void) | null>(null);
  const forceParamsRef = useRef<ForceParams>({ ...DEFAULT_FORCE_PARAMS });
  const dragAlphaTargetRef = useRef(DEFAULT_FORCE_PARAMS.dragAlphaTarget);
  const nodeRadiusRef = useRef(DEFAULT_FORCE_PARAMS.nodeRadius);
  const prevEggModeRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const currentDataset = useStore((s) => s.getCurrentDataset());
  const selectedStatementId = useStore((s) => s.selectedStatementId);
  const selectStatement = useStore((s) => s.selectStatement);
  const stringSet = useStore((s) => s.getCurrentStringSet());
  const datasetVersion = useStore((s) => s.datasetVersion);
  const eggMode = useStore((s) => s.eggMode);
  const eggParams = useStore((s) => s.eggParams);
  const eggVersion = useStore((s) => s.eggVersion);
  const setEggParam = useStore((s) => s.setEggParam);
  const resetEggParams = useStore((s) => s.resetEggParams);
  const setEggMode = useStore((s) => s.setEggMode);

  selectStatementRef.current = selectStatement;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions((prev) => {
            if (prev.width === width && prev.height === height) return prev;
            return { width, height };
          });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    builtRef.current = false;
  }, [datasetVersion]);

  useEffect(() => {
    const sim = simulationRef.current;
    if (!sim) { prevEggModeRef.current = eggMode; return; }

    if (!eggMode && prevEggModeRef.current) {
      const d = DEFAULT_FORCE_PARAMS;
      sim.force<d3.ForceLink<GraphNode, GraphLink>>('link')?.distance(d.linkDistance);
      sim.force<d3.ForceManyBody<GraphNode>>('charge')?.strength(d.chargeStrength);
      sim.force<d3.ForceCollide<GraphNode>>('collision')?.radius(d.collisionRadius);
      sim.alphaDecay(d.alphaDecay);
      sim.alpha(0.3).restart();
      nodeSelectionRef.current?.attr('r', d.nodeRadius);
      dragAlphaTargetRef.current = d.dragAlphaTarget;
      nodeRadiusRef.current = d.nodeRadius;
    } else if (eggMode) {
      const p = eggParams;
      sim.force<d3.ForceLink<GraphNode, GraphLink>>('link')?.distance(p.linkDistance);
      sim.force<d3.ForceManyBody<GraphNode>>('charge')?.strength(p.chargeStrength);
      sim.force<d3.ForceCollide<GraphNode>>('collision')?.radius(p.collisionRadius);
      sim.alphaDecay(p.alphaDecay);
      sim.alpha(0.3).restart();
      nodeSelectionRef.current?.attr('r', p.nodeRadius);
      dragAlphaTargetRef.current = p.dragAlphaTarget;
      nodeRadiusRef.current = p.nodeRadius;
    }
    prevEggModeRef.current = eggMode;
  }, [eggMode, eggVersion]);

  useEffect(() => {
    if (!currentDataset || !svgRef.current || builtRef.current) return;
    if (dimensions.width <= 0 || dimensions.height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodeColor = getCSSVariable('--graph-node');
    const nodeStroke = getCSSVariable('--graph-node-stroke');
    const labelColor = getCSSVariable('--graph-label');

    const { nodes, links } = prepareGraphData(currentDataset, stringSet);
    const params = forceParamsRef.current;
    const simulation = createSimulation(nodes, links, dimensions.width, dimensions.height, params);
    simulationRef.current = simulation;

    const nodeById = new Map(nodes.map(n => [n.id, n]));

    const defs = svg.append('defs');
    const markerSize = 8;
    const markerViewHeight = 5;
    const markerPath = 'M0,0 L10,2.5 L0,5 Z';

    for (const [type, color] of Object.entries(RELATIONSHIP_COLORS)) {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', `0 0 10 ${markerViewHeight}`)
        .attr('refX', 10)
        .attr('refY', 2.5)
        .attr('markerWidth', markerSize)
        .attr('markerHeight', markerSize * markerViewHeight / 10)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', markerPath)
        .attr('fill', color)
        .attr('fill-opacity', 0.6);
    }

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => RELATIONSHIP_COLORS[d.type] || '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => d.isDashed ? '5,5' : null);

    const regularNodes = nodes.filter(n => !n.isVirtual);
    const virtualNodes = nodes.filter(n => n.isVirtual);

    const node = g.append('g')
      .selectAll('circle')
      .data(regularNodes)
      .join('circle') as d3.Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>;

    nodeSelectionRef.current = node;

    node.attr('r', params.nodeRadius)
      .attr('fill', nodeColor)
      .attr('stroke', nodeStroke)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        selectStatementRef.current?.(d.id);
      })
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(dragAlphaTargetRef.current).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    const virtualNode = g.append('g')
      .selectAll('polygon')
      .data(virtualNodes)
      .join('polygon')
      .attr('points', '-12,0 0,-12 12,0 0,12')
      .attr('fill', '#F59E0B')
      .attr('stroke', nodeStroke)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer') as d3.Selection<SVGPolygonElement, GraphNode, SVGGElement, unknown>;

    virtualNodeSelectionRef.current = virtualNode;

    virtualNode.call(d3.drag<SVGPolygonElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(dragAlphaTargetRef.current).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    const labelGroup = g.append('g').attr('class', 'label-group');

    const labels = labelGroup.selectAll('foreignObject')
      .data(nodes)
      .join('foreignObject')
      .attr('width', LABEL_WIDTH)
      .attr('height', LABEL_HEIGHT)
      .style('overflow', 'visible')
      .style('pointer-events', 'none');

    labels.append('xhtml:div')
      .style('text-align', 'center')
      .style('font-size', '10px')
      .style('color', labelColor)
      .style('line-height', '1.2')
      .style('white-space', 'nowrap')
      .html((d) => renderKatex(d.label));

    const virtualLabelGroup = g.append('g').attr('class', 'virtual-label-group');

    const virtualLabels = virtualLabelGroup.selectAll('text')
      .data(virtualNodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => {
          const t = nodeById.get(d.target.id);
          if (!t || d.type !== 'implies') return d.target.x;
          const r = t.isVirtual ? 12 : nodeRadiusRef.current;
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          return d.target.x - (dx / dist) * r;
        })
        .attr('y2', (d: any) => {
          const t = nodeById.get(d.target.id);
          if (!t || d.type !== 'implies') return d.target.y;
          const r = t.isVirtual ? 12 : nodeRadiusRef.current;
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          return d.target.y - (dy / dist) * r;
        })
        .attr('marker-end', (d: any) => d.type === 'implies' ? `url(#arrow-${d.type})` : null);

      node
        .attr('cx', (d) => d.x || 0)
        .attr('cy', (d) => d.y || 0);

      virtualNode
        .attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);

      virtualLabels
        .attr('x', (d) => d.x || 0)
        .attr('y', (d) => d.y || 0);

      labels
        .attr('x', (d) => (d.x || 0) - LABEL_WIDTH / 2)
        .attr('y', (d) => (d.y || 0) + 22);
    });

    builtRef.current = true;

    return undefined;
  }, [currentDataset, stringSet, dimensions]);

  useEffect(() => {
    if (!nodeSelectionRef.current) return;
    const accentColor = getCSSVariable('--accent');
    const nodeColor = getCSSVariable('--graph-node');
    nodeSelectionRef.current
      .attr('fill', (d) => (d.id === selectedStatementId ? accentColor : nodeColor));

    if (!virtualNodeSelectionRef.current) return;
    virtualNodeSelectionRef.current
      .attr('fill', (d) => (d.id === selectedStatementId ? accentColor : '#F59E0B'));
  }, [selectedStatementId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: 'var(--graph-bg)', display: isVisible ? 'block' : 'none' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      {eggMode && (
        <ForceControlPanel
          params={eggParams}
          onChange={setEggParam}
          onReset={resetEggParams}
          onClose={() => setEggMode(false)}
        />
      )}
    </div>
  );
}
