# Component Playground

A powerful component showcase and testing environment that fetches UI components from a separate GitLab repository and provides an interactive playground for testing and documenting them.

## Features

- 🎨 **Interactive Component Preview** - Live rendering of components with real-time prop manipulation
- 🔧 **Dynamic Props Panel** - Automatically generated UI controls for component properties
- 📝 **Code Editor** - Monaco-based editor with TypeScript support for editing component code
- 📱 **Responsive Preview** - Test components in desktop, tablet, and mobile viewports
- 🔍 **Component Discovery** - Automatic scanning and cataloging of components from GitLab repository
- 📚 **Documentation Integration** - Support for JSDoc comments and component examples
- 🏷️ **Categorization & Tagging** - Organize components with categories and searchable tags
- 🚀 **Real-time Updates** - Fetch latest component versions from repository

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your GitLab settings:

```bash
cp env.example .env.local
```

Fill in your GitLab credentials in `.env.local`:

```env
NEXT_PUBLIC_GITLAB_TOKEN=your_gitlab_personal_access_token
NEXT_PUBLIC_GITLAB_PROJECT_ID=your_component_repository_project_id
NEXT_PUBLIC_GITLAB_URL=https://gitlab.com
```

### 2. GitLab Token Setup

1. Go to GitLab → Profile → Access Tokens
2. Create a new token with `read_repository` scope
3. Copy the token to your `.env.local` file

### 3. Access the Playground

Navigate to `/playground` in your Next.js application to start using the component playground.

## Component Repository Structure

For optimal integration, structure your component repository as follows:

```
ui-components/
├── component-manifest.json          # Auto-generated component registry
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── index.ts            # Export file
│   │   │   ├── Button.tsx          # Main component
│   │   │   ├── Button.types.ts     # TypeScript definitions
│   │   │   ├── Button.stories.tsx  # Storybook stories (optional)
│   │   │   └── Button.test.tsx     # Tests (optional)
│   │   ├── Input/
│   │   │   ├── index.ts
│   │   │   ├── Input.tsx
│   │   │   └── Input.types.ts
│   │   └── index.ts                # Main components export
│   ├── hooks/                      # Reusable hooks
│   ├── utils/                      # Utility functions
│   └── types/                      # Shared type definitions
├── docs/                           # Component documentation
│   ├── Button.md
│   └── Input.md
├── examples/                       # Usage examples
│   └── playground-examples/
├── scripts/
│   ├── build-manifest.js           # Generate component manifest
│   └── generate-docs.js            # Auto-generate documentation
└── package.json
```

## Component Manifest

The component manifest (`component-manifest.json`) is the central registry that describes all available components. It can be auto-generated or manually maintained.

### Example Manifest Structure

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "components": [
    {
      "name": "Button",
      "path": "src/components/Button/Button.tsx",
      "description": "A versatile button component with multiple variants",
      "category": "Form",
      "tags": ["button", "form", "interactive"],
      "props": {
        "variant": {
          "type": "enum",
          "options": ["primary", "secondary", "danger"],
          "default": "primary",
          "description": "Button appearance variant"
        },
        "size": {
          "type": "enum", 
          "options": ["small", "medium", "large"],
          "default": "medium",
          "description": "Button size"
        },
        "disabled": {
          "type": "boolean",
          "default": false,
          "description": "Whether the button is disabled"
        },
        "children": {
          "type": "string",
          "required": true,
          "description": "Button content"
        }
      },
      "examples": [
        {
          "name": "Primary Button",
          "props": { "variant": "primary", "children": "Click me" }
        },
        {
          "name": "Large Danger Button", 
          "props": { "variant": "danger", "size": "large", "children": "Delete" }
        }
      ]
    }
  ]
}
```

## Component Development Guidelines

### 1. TypeScript Interfaces

Define clear prop interfaces for automatic type detection:

```typescript
interface ButtonProps {
  /** Button appearance variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium', 
  disabled = false,
  children,
  onClick
}) => {
  // Component implementation
};
```

### 2. JSDoc Documentation

Use JSDoc comments for automatic documentation extraction:

```typescript
/**
 * A versatile button component with multiple variants and sizes.
 * 
 * @example
 * <Button variant="primary">Click me</Button>
 * 
 * @example
 * <Button variant="danger" size="large" disabled>
 *   Delete Item
 * </Button>
 */
export const Button: React.FC<ButtonProps> = (props) => {
  // Implementation
};
```

### 3. Default Export

Always provide a default export for the main component:

```typescript
export default Button;
```

## Playground Features

### Interactive Props Panel

The props panel automatically generates appropriate input controls based on prop types:

- **String/Text**: Text input
- **Number**: Number input  
- **Boolean**: Checkbox
- **Enum/Select**: Dropdown selection
- **Array/Object**: JSON editor
- **Color**: Color picker

### Code Editor

- **Monaco Editor**: Full-featured code editor with TypeScript support
- **Live Editing**: Real-time component updates as you edit
- **Format Code**: Built-in code formatting
- **Error Handling**: Clear error messages for invalid code

### Responsive Testing

Test components across different viewport sizes:
- **Desktop**: Full width preview
- **Tablet**: 768px max width
- **Mobile**: 375px max width

### Component Discovery

The playground can discover components through two methods:

1. **Manifest File**: Read from `component-manifest.json` (recommended)
2. **Repository Scanning**: Automatically scan repository structure

## Advanced Configuration

### Custom Component Categories

Define custom categories in your manifest:

```json
{
  "components": [
    {
      "name": "DataTable",
      "category": "Data Display",
      // ...
    }
  ]
}
```

### Prop Validation

Add validation rules for props:

```json
{
  "props": {
    "maxLength": {
      "type": "number",
      "validation": {
        "min": 1,
        "max": 1000
      }
    },
    "email": {
      "type": "string", 
      "validation": {
        "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
      }
    }
  }
}
```

### Custom Component Examples

Provide multiple usage examples:

```json
{
  "examples": [
    {
      "name": "Basic Usage",
      "description": "Simple button with default styling",
      "props": { "children": "Click me" }
    },
    {
      "name": "Advanced Usage", 
      "description": "Complex configuration example",
      "props": { 
        "variant": "danger", 
        "size": "large",
        "disabled": false,
        "children": "Delete Account"
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Components not loading**: Check GitLab token permissions and project ID
2. **Code editor not working**: Ensure Monaco Editor CDN is accessible
3. **Props not detected**: Verify TypeScript interface definitions
4. **Preview not updating**: Check for JavaScript errors in component code

### Debug Mode

Enable debug logging by adding to your environment:

```env
NEXT_PUBLIC_DEBUG_PLAYGROUND=true
```

## Contributing

When adding new components to your repository:

1. Follow the established folder structure
2. Include TypeScript prop definitions
3. Add JSDoc documentation
4. Provide usage examples
5. Update the component manifest (if manually maintained)
6. Test in the playground before merging

## API Reference

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GITLAB_TOKEN` | GitLab personal access token | Yes |
| `NEXT_PUBLIC_GITLAB_PROJECT_ID` | GitLab project ID | Yes |
| `NEXT_PUBLIC_GITLAB_URL` | GitLab instance URL | No (defaults to gitlab.com) |
| `NEXT_PUBLIC_GITLAB_BRANCH` | Repository branch | No (defaults to main) |

### Manifest Schema

The component manifest follows a structured schema for consistent component discovery and rendering. See the TypeScript definitions in `app/playground/utils/componentManifest.ts` for the complete schema.

## License

This playground system is part of your Next.js application and follows the same license terms. 