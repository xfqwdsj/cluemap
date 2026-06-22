import { useStore } from '../store';

describe('Zustand Store', () => {
  beforeEach(() => {
    useStore.setState({
      datasets: [],
      currentDatasetId: null,
      currentStringSetIndex: 0,
      selectedStatementId: null,
      searchQuery: '',
      activeTab: 'graph'
    });
  });

  it('should add dataset', () => {
    const dataset = {
      id: 'test',
      name: 'Test',
      statements: [],
      connections: [],
      stringSets: []
    };
    
    useStore.getState().addDataset(dataset);
    expect(useStore.getState().datasets).toHaveLength(1);
  });

  it('should set current dataset', () => {
    const dataset = {
      id: 'test',
      name: 'Test',
      statements: [],
      connections: [],
      stringSets: []
    };
    
    useStore.getState().addDataset(dataset);
    useStore.getState().setCurrentDataset('test');
    expect(useStore.getState().currentDatasetId).toBe('test');
  });

  it('should select statement', () => {
    useStore.getState().selectStatement('a');
    expect(useStore.getState().selectedStatementId).toBe('a');
  });

  it('should set search query', () => {
    useStore.getState().setSearchQuery('test');
    expect(useStore.getState().searchQuery).toBe('test');
  });

  it('should set active tab', () => {
    useStore.getState().setActiveTab('tree');
    expect(useStore.getState().activeTab).toBe('tree');
  });
});
