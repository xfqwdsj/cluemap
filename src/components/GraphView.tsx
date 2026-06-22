'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import katex from 'katex';
import { useStore } from '@/lib/store';
import { prepareGraphData, createSimulation, RELATIONSHIP_COLORS } from '@/lib/graph-utils';
import { GraphNode, GraphLink } from '@/lib/graph-utils';

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const currentDataset = useStore((s) => s.getCurrentDataset());
  const selectedStatementId = useStore((s) => s.selectedStatementId);
  const selectStatement = useStore((s) => s.selectStatement);
  const stringSet = useStore((s) => s.getCurrentStringSet());
  const datasetVersion = useStore((s) => s.datasetVersion);

  // Keep ref in sync
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

  // Detect dataset change and reset built state
  useEffect(() => {
    builtRef.current = false;
  }, [datasetVersion]);

  // Build graph when dataset is available
  useEffect(() => {
    if (!currentDataset || !svgRef.current || builtRef.current) return;
    if (dimensions.width <= 0 || dimensions.height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = prepareGraphData(currentDataset, stringSet);
    const simulation = createSimulation(nodes, links, dimensions.width, dimensions.height);
    simulationRef.current = simulation;

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 6')
      .attr('refX', 32)
      .attr('refY', 3)
      .attr('markerWidth', 8)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L10,3 L0,6 Z')
      .attr('fill', '#3B82F6');

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => RELATIONSHIP_COLORS[d.type] || '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => d.isDashed ? '5,5' : null)
      .attr('marker-end', (d) => d.type === 'implies' ? 'url(#arrowhead)' : null);

    const regularNodes = nodes.filter(n => !n.isVirtual);
    const virtualNodes = nodes.filter(n => n.isVirtual);

    // Regular nodes (circles)
    const node = g.append('g')
      .selectAll('circle')
      .data(regularNodes)
      .join('circle') as d3.Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>;

    nodeSelectionRef.current = node;

    node.attr('r', 18)
      .attr('fill', '#6B7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        selectStatementRef.current?.(d.id);
      })
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
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

    // Virtual nodes (diamonds)
    const virtualNode = g.append('g')
      .selectAll('polygon')
      .data(virtualNodes)
      .join('polygon')
      .attr('points', '-12,0 0,-12 12,0 0,12')
      .attr('fill', '#F59E0B')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer') as d3.Selection<SVGPolygonElement, GraphNode, SVGGElement, unknown>;

    virtualNodeSelectionRef.current = virtualNode;

    virtualNode.call(d3.drag<SVGPolygonElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
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

    // KaTeX labels via foreignObject
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
      .style('color', '#374151')
      .style('line-height', '1.2')
      .style('white-space', 'nowrap')
      .html((d) => renderKatex(d.label));

    // Virtual node labels
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

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

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

  // Update node colors without recreating graph
  useEffect(() => {
    if (!nodeSelectionRef.current) return;
    nodeSelectionRef.current
      .attr('fill', (d) => (d.id === selectedStatementId ? '#3B82F6' : '#6B7280'));

    if (!virtualNodeSelectionRef.current) return;
    virtualNodeSelectionRef.current
      .attr('fill', (d) => (d.id === selectedStatementId ? '#3B82F6' : '#F59E0B'));
  }, [selectedStatementId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-50 rounded-lg overflow-hidden"
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
}
