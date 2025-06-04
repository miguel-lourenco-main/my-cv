'use client';

import { useState, useEffect } from 'react';

interface ComponentInfo {
  name: string;
  path: string;
  description: string;
  props: Record<string, any>;
  examples: any[];
  category?: string;
  tags?: string[];
}

interface ComponentSelectorProps {
  onSelect: (component: ComponentInfo) => void;
}

export function ComponentSelector({ onSelect }: ComponentSelectorProps) {
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from component manifest first
      const manifestComponents = await fetchComponentManifest();
      if (manifestComponents.length > 0) {
        setComponents(manifestComponents);
        return;
      }

      // Fallback to scanning repository structure
      const scannedComponents = await scanRepositoryForComponents();
      setComponents(scannedComponents);

    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to load components. Using mock data for demo.');
      
      // Use mock data for development/demo
      setComponents(getMockComponents());
    } finally {
      setLoading(false);
    }
  };

  const fetchComponentManifest = async (): Promise<ComponentInfo[]> => {
    const GITLAB_TOKEN = process.env.NEXT_PUBLIC_GITLAB_TOKEN;
    const PROJECT_ID = process.env.NEXT_PUBLIC_GITLAB_PROJECT_ID;
    const GITLAB_URL = process.env.NEXT_PUBLIC_GITLAB_URL || 'https://gitlab.com';

    if (!GITLAB_TOKEN || !PROJECT_ID) {
      throw new Error('GitLab configuration missing');
    }

    try {
      const response = await fetch(
        `${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/repository/files/component-manifest.json/raw?ref=main`,
        {
          headers: {
            'Authorization': `Bearer ${GITLAB_TOKEN}`,
          },
        }
      );

      if (response.ok) {
        const manifest = await response.json();
        return manifest.components || [];
      }
      
      return [];
    } catch (error) {
      console.warn('Component manifest not found, falling back to repository scan');
      return [];
    }
  };

  const scanRepositoryForComponents = async (): Promise<ComponentInfo[]> => {
    const GITLAB_TOKEN = process.env.NEXT_PUBLIC_GITLAB_TOKEN;
    const PROJECT_ID = process.env.NEXT_PUBLIC_GITLAB_PROJECT_ID;
    const GITLAB_URL = process.env.NEXT_PUBLIC_GITLAB_URL || 'https://gitlab.com';

    if (!GITLAB_TOKEN || !PROJECT_ID) {
      throw new Error('GitLab configuration missing');
    }

    try {
      // Fetch repository tree
      const response = await fetch(
        `${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/repository/tree?recursive=true&path=src/components`,
        {
          headers: {
            'Authorization': `Bearer ${GITLAB_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch repository tree');
      }

      const files = await response.json();
      const componentFiles = files.filter((file: any) => 
        file.type === 'blob' && 
        file.name.endsWith('.tsx') && 
        !file.name.includes('.test.') &&
        !file.name.includes('.stories.')
      );

      // Parse component information from files
      const components: ComponentInfo[] = [];
      for (const file of componentFiles) {
        try {
          const componentInfo = await parseComponentInfo(file);
          if (componentInfo) {
            components.push(componentInfo);
          }
        } catch (err) {
          console.warn(`Failed to parse component info for ${file.name}:`, err);
        }
      }

      return components;
    } catch (error) {
      console.error('Error scanning repository:', error);
      throw error;
    }
  };

  const parseComponentInfo = async (file: any): Promise<ComponentInfo | null> => {
    // Basic component info extraction - this can be enhanced
    const componentName = file.name.replace('.tsx', '');
    
    return {
      name: componentName,
      path: file.path,
      description: `${componentName} component`,
      props: {},
      examples: [{}],
      category: 'General',
      tags: [componentName.toLowerCase()]
    };
  };

  const getMockComponents = (): ComponentInfo[] => [
    {
      name: 'Button',
      path: 'src/components/Button/Button.tsx',
      description: 'A versatile button component with multiple variants',
      props: {
        variant: { type: 'string', default: 'primary', options: ['primary', 'secondary', 'danger'] },
        size: { type: 'string', default: 'medium', options: ['small', 'medium', 'large'] },
        disabled: { type: 'boolean', default: false },
        children: { type: 'string', default: 'Click me' }
      },
      examples: [
        { variant: 'primary', children: 'Primary Button' },
        { variant: 'secondary', children: 'Secondary Button' },
        { variant: 'danger', children: 'Danger Button', size: 'large' }
      ],
      category: 'Form',
      tags: ['button', 'form', 'interactive']
    },
    {
      name: 'Input',
      path: 'src/components/Input/Input.tsx',
      description: 'Text input component with validation states',
      props: {
        type: { type: 'string', default: 'text', options: ['text', 'email', 'password', 'number'] },
        placeholder: { type: 'string', default: 'Enter text...' },
        error: { type: 'string', default: '' },
        disabled: { type: 'boolean', default: false }
      },
      examples: [
        { placeholder: 'Enter your name', type: 'text' },
        { placeholder: 'Enter email', type: 'email' },
        { placeholder: 'With error', error: 'This field is required' }
      ],
      category: 'Form',
      tags: ['input', 'form', 'text']
    },
    {
      name: 'Card',
      path: 'src/components/Card/Card.tsx',
      description: 'Container component for grouping related content',
      props: {
        title: { type: 'string', default: 'Card Title' },
        children: { type: 'string', default: 'Card content goes here...' },
        elevated: { type: 'boolean', default: false }
      },
      examples: [
        { title: 'Simple Card', children: 'This is a simple card component.' },
        { title: 'Elevated Card', children: 'This card has elevation.', elevated: true }
      ],
      category: 'Layout',
      tags: ['card', 'container', 'layout']
    }
  ];

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags?.some(tag => tag.includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(components.map(c => c.category).filter(Boolean)))];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Components</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Components List */}
      <div className="space-y-2">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No components found</p>
          </div>
        ) : (
          filteredComponents.map((component) => (
            <div
              key={component.path}
              onClick={() => onSelect(component)}
              className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{component.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                  
                  {/* Tags */}
                  {component.tags && component.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {component.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {component.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{component.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Category Badge */}
                {component.category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md ml-2">
                    {component.category}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={fetchComponents}
          disabled={loading}
          className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Components'}
        </button>
      </div>
    </div>
  );
} 