export type Locale = 'zh' | string;

export interface LocaleMessages {
  // App
  appName: string;
  // Tabs
  graphView: string;
  treeView: string;
  detailView: string;
  // Sidebar
  searchPlaceholder: string;
  noStatements: string;
  noDataset: string;
  // Upload
  uploadDataset: string;
  uploadStringSet: string;
  uploadTitle: string;
  dragDropHint: string;
  dragRelease: string;
  browse: string;
  jsonOnly: string;
  jsonFilesOnly: string;
  fileAccessError: string;
  parseError: string;
  selectDatasetFirst: string;
  // Detail
  selectStatement: string;
  relationshipLegend: string;
  derivesFromThis: string;
  derivedFrom: string;
  derivesThis: string;
  derivedFromThisDirection: string;
  participatesAsPremise: string;
  derivedFromCompound: string;
  noConnections: string;
  // Relationship types
  impliesLabel: string;
  inverseLabel: string;
  equivalentLabel: string;
  subsetLabel: string;
  // Compound conditions
  andCondition: string;
  orCondition: string;
  // Tree
  derivationTree: string;
  // Language
  language: string;
  chinese: string;
  uploadLanguagePack: string;
  selectJsonLanguagePack: string;
  localeMissingField: string;
  localeInvalid: string;
  // StringSet
  stringSet: string;
  noStringSet: string;
  // Category
  category: string;
  allCategories: string;
  // Validator
  dataValidation: string;
  errorCount: string;
  warningCount: string;
  validationPassed: string;
  noIssuesFound: string;
  copyReport: string;
  locate: string;
  datasetSummary: string;
  nodeCount: string;
  connectionCount: string;
  stringSetCount: string;
  categoryCount: string;
  unknownDataset: string;
  validationReportTitle: string;
  generatedAt: string;
  // Sidebar
  toggleSidebar: string;
  closeSidebar: string;
  // Dark mode
  darkMode: string;
  lightMode: string;
  followSystem: string;
  // Recent files
  recentFiles: string;
  noRecentFiles: string;
  deleteEntry: string;
  today: string;
  yesterday: string;
  daysAgo: string;
  // URL input
  urlInputLabel: string;
  urlInputPlaceholder: string;
  urlLoad: string;
  urlLoading: string;
  urlErrorInvalid: string;
  urlErrorNetwork: string;
  urlErrorFetch: string;
  orText: string;
}

const zh: LocaleMessages = {
  appName: 'ClueMap',
  graphView: '图视图',
  treeView: '树视图',
  detailView: '详情视图',
  searchPlaceholder: '搜索陈述...',
  noStatements: '未找到陈述',
  noDataset: '未加载数据集',
  uploadDataset: '上传数据集',
  uploadStringSet: '上传字符串集',
  uploadTitle: '上传数据集',
  dragDropHint: '拖放 JSON 文件到此处，或',
  dragRelease: '松开以上传文件',
  browse: '浏览',
  jsonOnly: '仅支持 JSON 文件',
  jsonFilesOnly: '请上传 JSON 文件',
  fileAccessError: '文件访问失败',
  parseError: '解析文件失败',
  selectDatasetFirst: '请先选择一个数据集',
  selectStatement: '选择一个陈述查看详情',
  relationshipLegend: '关系图例',
  derivesFromThis: '由此推出',
  derivedFrom: '由此推出',
  derivesThis: '由此可得',
  derivedFromThisDirection: '由此可推',
  participatesAsPremise: '作为前提参与',
  derivedFromCompound: '由复合条件推出',
  noConnections: '未找到相关连接',
  impliesLabel: '推出',
  inverseLabel: '互反',
  equivalentLabel: '等价',
  subsetLabel: '子集',
  andCondition: '且条件',
  orCondition: '或条件',
  derivationTree: '推导树',
  language: '语言',
  chinese: '中文',
  uploadLanguagePack: '上传语言包',
  selectJsonLanguagePack: '选择 JSON 语言包文件',
  localeMissingField: '语言包缺少必要字段: ',
  localeInvalid: '语言包格式无效',
  stringSet: '字符串集',
  noStringSet: '无字符串集',
  category: '分类',
  allCategories: '全部分类',
  dataValidation: '数据校验',
  errorCount: '错误',
  warningCount: '警告',
  validationPassed: '校验通过',
  noIssuesFound: '未发现任何问题。',
  darkMode: '深色模式',
  lightMode: '浅色模式',
  followSystem: '跟随系统',
  copyReport: '复制校验报告',
  locate: '定位',
  datasetSummary: '数据集摘要',
  nodeCount: '节点数',
  connectionCount: '连接数',
  stringSetCount: '字符串集',
  categoryCount: '分类数',
  unknownDataset: '未知数据集',
  validationReportTitle: '数据校验报告 - ',
  generatedAt: '生成时间: ',
  toggleSidebar: '切换侧边栏',
  closeSidebar: '关闭侧边栏',
  recentFiles: '最近文件',
  noRecentFiles: '暂无最近文件',
  deleteEntry: '删除记录',
  today: '今天',
  yesterday: '昨天',
  daysAgo: '天前',
  urlInputLabel: '或输入 URL',
  urlInputPlaceholder: 'https://example.com/data.json',
  urlLoad: '加载',
  urlLoading: '加载中...',
  urlErrorInvalid: '请输入有效的 URL',
  urlErrorNetwork: '网络错误，请检查连接',
  urlErrorFetch: '加载失败',
  orText: '或',
};

const locales: Record<string, LocaleMessages> = {
  zh,
};

export function getLocale(locale: Locale): LocaleMessages {
  return locales[locale] || zh;
}

export function setLocale(locale: Locale, messages: LocaleMessages): void {
  locales[locale] = messages;
}

export function getAvailableLocales(): string[] {
  return Object.keys(locales);
}
