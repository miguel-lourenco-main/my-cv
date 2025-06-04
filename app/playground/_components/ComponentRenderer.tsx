'use client';

import { useState, useEffect, useRef, ErrorInfo, ReactNode } from 'react';
import * as React from 'react';

interface ComponentRendererProps {
  code: string;
  props: Record<string, any>;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component rendering error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">Component Error</h3>
          <p className="text-red-600 text-sm mb-2">
            Failed to render component. Check the console for more details.
          </p>
          <details className="text-xs text-red-500">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ComponentRenderer({ code, props }: ComponentRendererProps) {
  const [RenderedComponent, setRenderedComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code) return;

    const renderComponent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Transform the code to a React component
        const componentCode = transformCodeToComponent(code);
        
        // Create a blob URL for the component
        const blob = new Blob([componentCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        // Dynamic import the component
        const module = await import(/* webpackIgnore: true */ url);
        const Component = module.default || module.Component;

        if (Component) {
          setRenderedComponent(() => Component);
        } else {
          throw new Error('No default export found in component code');
        }

        // Clean up the blob URL
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error rendering component:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    renderComponent();
  }, [code]);

  const handleError = (error: Error) => {
    setError(error.message);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Rendering component...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-yellow-800 font-medium mb-2">Rendering Error</h3>
        <p className="text-yellow-700 text-sm">{error}</p>
        <div className="mt-3">
          <button
            onClick={() => window.location.reload()}
            className="text-yellow-800 underline text-sm hover:text-yellow-900"
          >
            Refresh to try again
          </button>
        </div>
      </div>
    );
  }

  if (!RenderedComponent) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-600">No component to render</p>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <div className="component-preview">
        <RenderedComponent {...props} />
      </div>
    </ErrorBoundary>
  );
}

// Transform component code to be dynamically importable
function transformCodeToComponent(code: string): string {
  // Basic transformation - this can be enhanced with proper AST parsing
  let transformedCode = code;

  // Add React import if not present
  if (!transformedCode.includes('import React') && !transformedCode.includes('import * as React')) {
    transformedCode = `import React from 'react';\n${transformedCode}`;
  }

  // Ensure there's a default export
  if (!transformedCode.includes('export default') && !transformedCode.includes('export {')) {
    // Try to find the main component and export it
    const componentMatch = transformedCode.match(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/);
    if (componentMatch) {
      transformedCode += `\nexport default ${componentMatch[1]};`;
    }
  }

  // Wrap in module format
  return `
    ${transformedCode}
  `;
}

// Alternative iframe-based renderer for better isolation
export function IframeComponentRenderer({ code, props }: ComponentRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .error { color: red; padding: 16px; background: #fee; border: 1px solid #fcc; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              ${code}
              
              const props = ${JSON.stringify(props)};
              const element = React.createElement(Component || (() => React.createElement('div', null, 'Component not found')), props);
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(element);
            } catch (error) {
              console.error('Rendering error:', error);
              document.getElementById('root').innerHTML = 
                '<div class="error">Error rendering component: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }, [code, props]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-64 border border-gray-300 rounded-md"
      title="Component Preview"
      sandbox="allow-scripts"
    />
  );
} 