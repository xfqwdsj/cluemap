import { parseDataSet } from '../parser';
import { validateDataset } from '../validator';

describe('parseDataSet', () => {
  it('should parse valid dataset JSON', () => {
    const validJson = {
      id: 'test-1',
      name: 'Test Dataset',
      statements: [{ id: 'a' }, { id: 'b' }],
      connections: [{ from: 'a', to: 'b', type: 'implies' }],
      stringSets: [{
        name: 'English',
        language: 'en',
        entries: { a: 'Statement A', b: 'Statement B' }
      }]
    };
    
    const result = parseDataSet(JSON.stringify(validJson));
    expect(result).toEqual(validJson);
  });

  it('should throw error for invalid JSON', () => {
    expect(() => parseDataSet('invalid')).toThrow();
  });

  it('should throw error for missing required fields', () => {
    const invalid = { id: 'test' };
    expect(() => parseDataSet(JSON.stringify(invalid))).toThrow();
  });
});

describe('validateDataset (schema)', () => {
  it('should validate correct dataset', () => {
    const valid = {
      id: 'test',
      name: 'Test',
      statements: [],
      connections: [],
      stringSets: []
    };
    expect(validateDataset(valid)).toHaveLength(0);
  });

  it('should reject dataset with invalid virtualNode (less than 2 premises)', () => {
    const invalid = {
      id: 'test',
      name: 'Test',
      statements: [{ id: 'a' }],
      connections: [],
      stringSets: [],
      virtualNodes: [{
        id: 'vn-1',
        type: 'and',
        premises: ['a'],
        target: 'b',
        relationship: 'implies'
      }]
    };
    const issues = validateDataset(invalid);
    expect(issues.some(i => i.message.includes('至少需要 2 个前提'))).toBe(true);
  });

  it('should reject dataset with invalid connection type', () => {
    const invalid = {
      id: 'test',
      name: 'Test',
      statements: [],
      connections: [{ from: 'a', to: 'b', type: 'invalid' }],
      stringSets: []
    };
    const issues = validateDataset(invalid);
    expect(issues.some(i => i.message.includes('无效的连接类型'))).toBe(true);
  });
});
