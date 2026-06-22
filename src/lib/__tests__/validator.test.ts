import { validateDataset } from '../validator';
import { DataSet } from '@/types';

describe('validateDataset', () => {
  const baseDataset: DataSet = {
    id: 'test',
    name: 'Test',
    statements: [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' }
    ],
    connections: [
      { from: 'a', to: 'b', type: 'implies' },
      { from: 'b', to: 'c', type: 'implies' }
    ],
    stringSets: []
  };

  it('should pass for valid dataset without virtualNodes', () => {
    expect(validateDataset(baseDataset)).toHaveLength(0);
  });

  it('should error when virtualNode references non-existent premise', () => {
    const dataset: DataSet = {
      ...baseDataset,
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'nonexistent'],
        target: 'c',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('不存在的节点'))).toBe(true);
  });

  it('should error when virtualNode references non-existent target', () => {
    const dataset: DataSet = {
      ...baseDataset,
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'b'],
        target: 'nonexistent',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('不存在的节点'))).toBe(true);
  });

  it('should warn on duplicate virtualNode id', () => {
    const dataset: DataSet = {
      ...baseDataset,
      virtualNodes: [
        { id: 'vn-1', type: 'and', premises: ['a', 'b'], target: 'c', relationship: 'implies' },
        { id: 'vn-1', type: 'or', premises: ['a', 'b'], target: 'c', relationship: 'implies' }
      ]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('重复的虚拟节点'))).toBe(true);
  });

  it('should error when virtualNode has same premise appearing twice', () => {
    const dataset: DataSet = {
      ...baseDataset,
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'a'],
        target: 'c',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('重复的前提'))).toBe(true);
  });

  it('should warn when premise is the same as target', () => {
    const dataset: DataSet = {
      ...baseDataset,
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'c'],
        target: 'c',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('前提包含目标节点'))).toBe(true);
  });

  it('should not warn isolated node when connected via virtualNode', () => {
    const dataset: DataSet = {
      id: 'test',
      name: 'Test',
      statements: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' }
      ],
      connections: [],
      stringSets: [],
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'b'],
        target: 'c',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('孤立节点'))).toBe(false);
  });

  it('should still warn truly isolated nodes', () => {
    const dataset: DataSet = {
      id: 'test',
      name: 'Test',
      statements: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' }
      ],
      connections: [],
      stringSets: [],
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'b'],
        target: 'a',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('孤立节点') && i.nodeId === 'c')).toBe(true);
  });

  it('should include virtualNodes in connected components', () => {
    const dataset: DataSet = {
      id: 'test',
      name: 'Test',
      statements: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' }
      ],
      connections: [],
      stringSets: [],
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a', 'b'],
        target: 'c',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(dataset);
    expect(issues.some(i => i.message.includes('不连通的子图'))).toBe(false);
  });
});
