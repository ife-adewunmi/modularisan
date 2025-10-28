export interface AiAnalyzeOptions {
  type?: 'component' | 'service' | 'hook' | 'utility' | 'test' | 'other';
  output?: string;
  metrics?: boolean;
  format?: 'markdown' | 'json' | 'yaml' | 'table' | 'detailed';
  fix?: boolean;
}

export interface AiDocsOptions {
  type?: string;
  output?: string;
  format?: 'markdown' | 'html' | 'json';
  overwrite?: boolean;
  preview?: boolean;
}

export interface ConfigOptions {
  global?: boolean;
  json?: boolean;
}

export interface CreateComponentOptions {
  type?: string;
  props?: boolean;
  client?: boolean;
  story?: boolean;
  test?: boolean;
  yes?: boolean;
}

// Add more interfaces as needed...
