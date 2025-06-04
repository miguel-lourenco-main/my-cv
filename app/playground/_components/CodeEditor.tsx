'use client';

import { useEffect, useRef, useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = 'typescript', 
  height = '100%',
  readOnly = false 
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);

  useEffect(() => {
    // Load Monaco Editor dynamically
    const loadMonaco = async () => {
      try {
        // Load Monaco from CDN
        if (typeof window !== 'undefined' && !window.monaco) {
          // Create script tags for Monaco
          const loaderScript = document.createElement('script');
          loaderScript.src = 'https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js';
          
          loaderScript.onload = () => {
            window.require.config({ 
              paths: { 
                vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' 
              } 
            });
            
            window.require(['vs/editor/editor.main'], () => {
              setIsMonacoLoaded(true);
            });
          };
          
          document.head.appendChild(loaderScript);
        } else if (window.monaco) {
          setIsMonacoLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
      }
    };

    loadMonaco();
  }, []);

  useEffect(() => {
    if (!isMonacoLoaded || !editorRef.current || editor) return;

    try {
      const monacoEditor = window.monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: 'vs-light',
        automaticLayout: true,
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 4,
        renderLineHighlight: 'line',
        contextmenu: true,
        selectOnLineNumbers: true,
        roundedSelection: false,
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        smoothScrolling: true,
      });

      monacoEditor.onDidChangeModelContent(() => {
        const newValue = monacoEditor.getValue();
        onChange(newValue);
      });

      setEditor(monacoEditor);

      // Configure TypeScript compiler options
      if (window.monaco && language === 'typescript') {
        window.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: window.monaco.languages.typescript.ScriptTarget.Latest,
          allowNonTsExtensions: true,
          moduleResolution: window.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: window.monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: window.monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types'],
        });

        // Add React types
        const reactTypings = `
          declare module 'react' {
            export interface FC<P = {}> {
              (props: P): ReactElement<any, any> | null;
            }
            export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
              type: T;
              props: P;
              key: Key | null;
            }
            export type Key = string | number;
            export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);
            export class Component<P = {}, S = {}, SS = any> {}
          }
        `;

        window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
          reactTypings,
          'react.d.ts'
        );
      }

    } catch (error) {
      console.error('Error creating Monaco editor:', error);
    }

    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, [isMonacoLoaded, editorRef.current]);

  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      const position = editor.getPosition();
      editor.setValue(value);
      if (position) {
        editor.setPosition(position);
      }
    }
  }, [value, editor]);

  if (!isMonacoLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div 
        ref={editorRef} 
        className="w-full h-full border border-gray-200"
        style={{ height }}
      />
      
      {/* Toolbar */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={() => {
            if (editor) {
              editor.getAction('editor.action.formatDocument').run();
            }
          }}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
          title="Format Code"
        >
          Format
        </button>
        
        {!readOnly && (
          <button
            onClick={() => {
              if (editor) {
                editor.setValue('');
                onChange('');
              }
            }}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
            title="Clear Code"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// Fallback textarea editor for cases where Monaco fails to load
export function FallbackCodeEditor({ 
  value, 
  onChange, 
  height = '400px',
  readOnly = false 
}: CodeEditorProps) {
  return (
    <div className="relative" style={{ height }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full h-full p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter your component code here..."
        spellCheck={false}
        style={{ 
          height,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          lineHeight: '1.5',
          tabSize: 2
        }}
      />
      
      <div className="absolute top-2 right-2 flex space-x-2">
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
          Fallback Editor
        </span>
      </div>
    </div>
  );
}

// Global Monaco types
declare global {
  interface Window {
    monaco: any;
    require: any;
  }
} 