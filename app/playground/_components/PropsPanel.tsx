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

interface PropsPanelProps {
  component: ComponentInfo;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

interface PropDefinition {
  type: string;
  default?: any;
  options?: any[];
  description?: string;
  required?: boolean;
}

export function PropsPanel({ component, values, onChange }: PropsPanelProps) {
  const [activeTab, setActiveTab] = useState<'props' | 'examples'>('props');

  const handlePropChange = (propName: string, value: any) => {
    const newValues = { ...values, [propName]: value };
    onChange(newValues);
  };

  const handleExampleSelect = (example: Record<string, any>) => {
    onChange(example);
  };

  const resetToDefaults = () => {
    const defaults: Record<string, any> = {};
    Object.entries(component.props).forEach(([key, propDef]) => {
      if (typeof propDef === 'object' && propDef.default !== undefined) {
        defaults[key] = propDef.default;
      }
    });
    onChange(defaults);
  };

  const exportProps = () => {
    const propsString = JSON.stringify(values, null, 2);
    navigator.clipboard.writeText(propsString);
  };

  const importProps = () => {
    const input = prompt('Paste JSON props:');
    if (input) {
      try {
        const parsed = JSON.parse(input);
        onChange(parsed);
      } catch (error) {
        alert('Invalid JSON format');
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Component Props</h3>
          
          <div className="flex space-x-2">
            <button
              onClick={exportProps}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title="Copy props as JSON"
            >
              Export
            </button>
            <button
              onClick={importProps}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title="Import props from JSON"
            >
              Import
            </button>
            <button
              onClick={resetToDefaults}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title="Reset to default values"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {(['props', 'examples'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'props' ? 'Properties' : 'Examples'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'props' ? (
          <PropsEditor
            props={component.props}
            values={values}
            onChange={handlePropChange}
          />
        ) : (
          <ExamplesPanel
            examples={component.examples}
            onSelect={handleExampleSelect}
            currentValues={values}
          />
        )}
      </div>
    </div>
  );
}

function PropsEditor({ 
  props, 
  values, 
  onChange 
}: { 
  props: Record<string, PropDefinition | any>;
  values: Record<string, any>;
  onChange: (propName: string, value: any) => void;
}) {
  if (Object.keys(props).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No props defined for this component</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(props).map(([propName, propDef]) => (
        <PropInput
          key={propName}
          name={propName}
          definition={propDef}
          value={values[propName]}
          onChange={(value) => onChange(propName, value)}
        />
      ))}
    </div>
  );
}

function PropInput({ 
  name, 
  definition, 
  value, 
  onChange 
}: {
  name: string;
  definition: PropDefinition | any;
  value: any;
  onChange: (value: any) => void;
}) {
  const propDef = typeof definition === 'object' ? definition : { type: 'string' };
  const { type, options, description, required } = propDef;

  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {value ? 'true' : 'false'}
            </span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
      case 'enum':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {options?.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="flex space-x-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? JSON.stringify(value, null, 2) : value || '[]'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                onChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={3}
            placeholder="[]"
          />
        );

      case 'object':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || '{}'}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                onChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={3}
            placeholder="{}"
          />
        );

      case 'multiline':
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {name}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-gray-500">{type}</span>
      </div>
      
      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}
      
      {renderInput()}
      
      {options && type !== 'select' && type !== 'enum' && (
        <div className="text-xs text-gray-500">
          Options: {options.join(', ')}
        </div>
      )}
    </div>
  );
}

function ExamplesPanel({ 
  examples, 
  onSelect, 
  currentValues 
}: {
  examples: any[];
  onSelect: (example: any) => void;
  currentValues: Record<string, any>;
}) {
  if (examples.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No examples available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Click an example to apply its props configuration:
      </p>
      
      {examples.map((example, index) => (
        <div
          key={index}
          onClick={() => onSelect(example)}
          className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Example {index + 1}
              </h4>
              <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(example, null, 2)}
              </pre>
            </div>
            
            {JSON.stringify(example) === JSON.stringify(currentValues) && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded ml-2">
                Active
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 