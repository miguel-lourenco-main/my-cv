export interface ComponentManifest {
  version: string;
  lastUpdated: string;
  components: ComponentInfo[];
}

export interface ComponentInfo {
  name: string;
  path: string;
  description: string;
  props: Record<string, PropDefinition>;
  examples: ComponentExample[];
  category?: string;
  tags?: string[];
  dependencies?: string[];
  version?: string;
  author?: string;
  documentation?: string;
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'color' | 'select';
  default?: any;
  options?: any[];
  description?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: string;
  };
}

export interface ComponentExample {
  name: string;
  description?: string;
  props: Record<string, any>;
  code?: string;
}

/**
 * Generates a component manifest from a repository structure
 */
export function generateManifest(components: ComponentInfo[]): ComponentManifest {
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    components: components.sort((a, b) => a.name.localeCompare(b.name))
  };
}

/**
 * Validates a component manifest structure
 */
export function validateManifest(manifest: any): manifest is ComponentManifest {
  if (!manifest || typeof manifest !== 'object') return false;
  
  const required = ['version', 'lastUpdated', 'components'];
  for (const field of required) {
    if (!(field in manifest)) return false;
  }
  
  if (!Array.isArray(manifest.components)) return false;
  
  return manifest.components.every((component: any) => validateComponent(component));
}

/**
 * Validates a single component definition
 */
export function validateComponent(component: any): component is ComponentInfo {
  if (!component || typeof component !== 'object') return false;
  
  const required = ['name', 'path', 'description'];
  for (const field of required) {
    if (!(field in component) || typeof component[field] !== 'string') return false;
  }
  
  return true;
}

/**
 * Extracts component information from TypeScript/JSX code
 */
export function parseComponentFromCode(code: string, filePath: string): Partial<ComponentInfo> {
  const componentName = extractComponentName(code, filePath);
  const props = extractPropsInterface(code);
  const examples = extractExamples(code);
  const description = extractJSDocDescription(code);
  
  return {
    name: componentName,
    path: filePath,
    description: description || `${componentName} component`,
    props,
    examples,
    category: inferCategory(filePath, code),
    tags: generateTags(componentName, code)
  };
}

/**
 * Extracts component name from code or file path
 */
function extractComponentName(code: string, filePath: string): string {
  // Try to find export default function/const/class
  const exportMatch = code.match(/export\s+default\s+(?:function\s+)?([A-Z][a-zA-Z0-9]*)/);
  if (exportMatch) return exportMatch[1];
  
  // Try to find named function/const/class
  const namedMatch = code.match(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/);
  if (namedMatch) return namedMatch[1];
  
  // Fallback to filename
  const filename = filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '');
  return filename || 'UnknownComponent';
}

/**
 * Extracts props interface from TypeScript code
 */
function extractPropsInterface(code: string): Record<string, PropDefinition> {
  const props: Record<string, PropDefinition> = {};
  
  // Find interface definitions
  const interfaceMatch = code.match(/interface\s+\w*Props\s*{([^}]*)}/);
  if (!interfaceMatch) return props;
  
  const interfaceBody = interfaceMatch[1];
  const propMatches = interfaceBody.match(/(\w+)(\?)?:\s*([^;]+);/g);
  
  if (!propMatches) return props;
  
  for (const propMatch of propMatches) {
    const match = propMatch.match(/(\w+)(\?)?:\s*([^;]+);/);
    if (!match) continue;
    
    const [, propName, optional, propType] = match;
    const isRequired = !optional;
    
    props[propName] = {
      type: mapTypeScriptType(propType.trim()),
      required: isRequired,
      description: `${propName} property`
    };
  }
  
  return props;
}

/**
 * Maps TypeScript types to our prop definition types
 */
function mapTypeScriptType(tsType: string): PropDefinition['type'] {
  if (tsType.includes('string')) return 'string';
  if (tsType.includes('number')) return 'number';
  if (tsType.includes('boolean')) return 'boolean';
  if (tsType.includes('[]') || tsType.includes('Array')) return 'array';
  if (tsType.includes('{') || tsType.includes('object')) return 'object';
  if (tsType.includes('|')) return 'enum';
  
  return 'string';
}

/**
 * Extracts examples from JSDoc comments or story files
 */
function extractExamples(code: string): ComponentExample[] {
  const examples: ComponentExample[] = [];
  
  // Look for @example tags in JSDoc
  const exampleMatches = code.match(/@example\s*\n\s*\*\s*([^*]+)/g);
  
  if (exampleMatches) {
    exampleMatches.forEach((match, index) => {
      const exampleCode = match.replace(/@example\s*\n\s*\*\s*/, '').trim();
      examples.push({
        name: `Example ${index + 1}`,
        props: {},
        code: exampleCode
      });
    });
  }
  
  // If no examples found, create a default one
  if (examples.length === 0) {
    examples.push({
      name: 'Default',
      props: {}
    });
  }
  
  return examples;
}

/**
 * Extracts JSDoc description
 */
function extractJSDocDescription(code: string): string | undefined {
  const jsdocMatch = code.match(/\/\*\*\s*\n\s*\*\s*([^@\n]+)/);
  return jsdocMatch ? jsdocMatch[1].trim() : undefined;
}

/**
 * Infers component category from file path and code
 */
function inferCategory(filePath: string, code: string): string {
  const path = filePath.toLowerCase();
  
  if (path.includes('form') || path.includes('input') || path.includes('button')) {
    return 'Form';
  }
  if (path.includes('layout') || path.includes('container') || path.includes('grid')) {
    return 'Layout';
  }
  if (path.includes('navigation') || path.includes('menu') || path.includes('nav')) {
    return 'Navigation';
  }
  if (path.includes('feedback') || path.includes('alert') || path.includes('toast')) {
    return 'Feedback';
  }
  if (path.includes('data') || path.includes('table') || path.includes('list')) {
    return 'Data Display';
  }
  
  return 'General';
}

/**
 * Generates relevant tags for a component
 */
function generateTags(componentName: string, code: string): string[] {
  const tags = [componentName.toLowerCase()];
  
  const codeContent = code.toLowerCase();
  
  if (codeContent.includes('onclick') || codeContent.includes('button')) {
    tags.push('interactive');
  }
  if (codeContent.includes('form') || codeContent.includes('input')) {
    tags.push('form');
  }
  if (codeContent.includes('useState') || codeContent.includes('useEffect')) {
    tags.push('stateful');
  }
  if (codeContent.includes('children')) {
    tags.push('container');
  }
  
  return Array.from(new Set(tags));
} 