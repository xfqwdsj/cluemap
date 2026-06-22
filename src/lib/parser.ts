import { DataSet, StringSet } from '@/types';
import { validateDataset } from './validator';

export function parseDataSet(jsonString: string): DataSet {
  const data = JSON.parse(jsonString);

  const issues = validateDataset(data);
  if (issues.some(i => i.type === 'error')) {
    const first = issues.find(i => i.type === 'error');
    throw new Error(first?.message || '数据集格式无效');
  }

  if (!data.stringSets) {
    data.stringSets = [];
  }

  return data as DataSet;
}

export function parseStringSet(jsonString: string): StringSet {
  const data = JSON.parse(jsonString);

  if (!validateStringSet(data)) {
    throw new Error('字符串集格式无效');
  }

  return data as StringSet;
}

export function validateStringSet(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.name || !data.language || !data.entries) return false;
  if (typeof data.entries !== 'object') return false;
  return true;
}
