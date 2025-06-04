'use client';

import { useState, useEffect, Suspense } from 'react';
import { ComponentRenderer } from './_components/ComponentRenderer';
import { ComponentSelector } from './_components/ComponentSelector';
import { CodeEditor } from './_components/CodeEditor';
import { PropsPanel } from './_components/PropsPanel';

interface ComponentInfo {
  name: string;
  path: string;
  description: string;
  props: Record<string, any>;
  examples: any[];
}

export default function PlaygroundPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null);
  const [componentCode, setComponentCode] = useState<string>('');
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  const handleComponentSelect = async (component: ComponentInfo) => {
    setIsLoading(true);
    try {
      // Fetch component code from GitLab
      const code = await fetchComponentCode(component.path);
      setSelectedComponent(component);
      setComponentCode(code);
      setComponentProps(component.examples[0] || {});
    } catch (error) {
      console.error('Failed to load component:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropsChange = (newProps: Record<string, any>) => {
    setComponentProps(newProps);
  };

  const handleCodeChange = (newCode: string) => {
    setComponentCode(newCode);
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      default: return 'max-w-full';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Component Playground</h1>
          
          {/* View Mode Selector */}
          <div className="flex space-x-2">
            {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Component Selector */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <ComponentSelector onSelect={handleComponentSelect} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedComponent ? (
            <>
              {/* Component Info Bar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedComponent.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedComponent.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(componentCode)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              <div className="flex-1 flex">
                {/* Code Editor */}
                <div className="w-1/2 border-r border-gray-200">
                  <CodeEditor
                    value={componentCode}
                    onChange={handleCodeChange}
                    language="typescript"
                  />
                </div>

                {/* Preview & Props Panel */}
                <div className="w-1/2 flex flex-col">
                  {/* Props Panel */}
                  <div className="h-1/3 border-b border-gray-200 overflow-y-auto">
                    <PropsPanel
                      component={selectedComponent}
                      values={componentProps}
                      onChange={handlePropsChange}
                    />
                  </div>

                  {/* Preview Area */}
                  <div className="flex-1 p-6 overflow-auto">
                    <div className={`mx-auto ${getViewportClass()}`}>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <Suspense fallback={
                          <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        }>
                          {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <ComponentRenderer
                              code={componentCode}
                              props={componentProps}
                            />
                          )}
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-5L9 9a2 2 0 00-2 2v10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Component
                </h3>
                <p className="text-gray-600">
                  Choose a component from the sidebar to start exploring
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// GitLab API integration
async function fetchComponentCode(componentPath: string): Promise<string> {
  const GITLAB_TOKEN = process.env.NEXT_PUBLIC_GITLAB_TOKEN;
  const PROJECT_ID = process.env.NEXT_PUBLIC_GITLAB_PROJECT_ID;
  const GITLAB_URL = process.env.NEXT_PUBLIC_GITLAB_URL || 'https://gitlab.com';

  if (!GITLAB_TOKEN || !PROJECT_ID) {
    throw new Error('GitLab configuration missing');
  }

  try {
    const response = await fetch(
      `${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/repository/files/${encodeURIComponent(componentPath)}/raw?ref=main`,
      {
        headers: {
          'Authorization': `Bearer ${GITLAB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch component: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching component code:', error);
    throw error;
  }
} 