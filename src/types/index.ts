export interface Statement {
  id: string;
  category?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface VirtualNode {
  id: string;
  type: 'and' | 'or';
  premises: string[];
  target: string;
  relationship: RelationshipType;
}

export interface Connection {
  from: string;
  to: string;
  type: RelationshipType;
}

export type RelationshipType =
  | 'implies'      // A → B (A implies B)
  | 'inverse'      // A ↔ B (mutually exclusive)
  | 'equivalent'   // A ⇔ B (logically equivalent)
  | 'subset';      // A ⊂ B (A is subset of B)

export interface StringSet {
  name: string;
  language: string;
  entries: Record<string, string>;
}

export interface DataSet {
  id: string;
  name: string;
  statements: Statement[];
  connections: Connection[];
  stringSets: StringSet[];
  categories?: Category[];
  virtualNodes?: VirtualNode[];
}

export interface AppState {
  datasets: DataSet[];
  currentDatasetId: string | null;
  currentStringSetIndex: number;
  selectedStatementId: string | null;
  searchQuery: string;
  activeTab: 'graph' | 'tree' | 'detail';
}
