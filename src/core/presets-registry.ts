/**
 * Modularisan Presets Registry
 *
 * Provides pre-built modules and components for common use cases
 */

export const PRESETS_REGISTRY = {
  // Authentication Module
  authentication: {
    name: 'Authentication',
    description: 'Complete auth module with login, register, JWT/session, and protected routes',
    template: 'authentication',
    files: [
      'services/auth-service.ts',
      'types/index.ts',
      'context/auth-provider.tsx',
      'components/protected-route.tsx',
    ],
    features: ['Login', 'Register', 'JWT Support', 'Session Management', 'Protected Routes'],
    dependencies: ['react'],
  },

  // API Client Module
  apiClient: {
    name: 'API Client',
    description: 'HTTP client with interceptors, retry logic, and error handling',
    template: 'api-client',
    files: ['services/api-client.ts'],
    features: ['Request/Response Interceptors', 'Retry Logic', 'Error Handling', 'Timeout Support'],
    dependencies: [],
  },

  // Form Management Module
  formManagement: {
    name: 'Form Management',
    description: 'Form state management with validation and error handling',
    template: 'form-management',
    files: [
      'hooks/use-form.ts',
      'components/form-components.tsx',
    ],
    features: ['Form Validation', 'Field Management', 'Error Handling', 'Multi-step Forms'],
    dependencies: ['react'],
  },

  // State Management - Zustand
  stateManagementZustand: {
    name: 'State Management (Zustand)',
    description: 'Lightweight state management with Redux DevTools and persistence',
    template: 'state-management/zustand',
    files: ['store/zustand-store.ts'],
    features: ['Redux DevTools', 'Persistence', 'Selectors', 'TypeScript Support'],
    dependencies: ['zustand'],
  },

  // State Management - Redux Toolkit
  stateManagementRedux: {
    name: 'State Management (Redux Toolkit)',
    description: 'Redux slice with actions, reducers, and selectors',
    template: 'state-management/redux',
    files: ['store/redux-slice.ts'],
    features: ['Redux Toolkit', 'Thunks Ready', 'Selectors', 'TypeScript Support'],
    dependencies: ['@reduxjs/toolkit', 'react-redux'],
  },

  // UI Components
  button: {
    name: 'Button Component',
    description: 'Accessible button with variants and sizes',
    template: 'ui-components/button',
    files: ['components/button.tsx'],
    features: ['Multiple Variants', 'Loading State', 'Accessibility', 'TypeScript'],
    dependencies: ['react'],
  },

  input: {
    name: 'Input Component',
    description: 'Text input with label, error, and helper text',
    template: 'ui-components/button', // Shares file with button
    files: ['components/button.tsx'],
    features: ['Label Support', 'Error Display', 'Helper Text', 'Accessibility'],
    dependencies: ['react'],
  },

  modal: {
    name: 'Modal Component',
    description: 'Accessible modal with keyboard support and overlay',
    template: 'ui-components/modal',
    files: ['components/modal.tsx'],
    features: ['Keyboard Support', 'Overlay Click', 'Accessible', 'Size Variants'],
    dependencies: ['react'],
  },

  card: {
    name: 'Card Component',
    description: 'Flexible card container with optional title and footer',
    template: 'ui-components/card',
    files: ['components/card.tsx'],
    features: ['Title Support', 'Footer Support', 'Hover Effects', 'Responsive'],
    dependencies: ['react'],
  },
};

// Type for preset keys
export type PresetKey = keyof typeof PRESETS_REGISTRY;

/**
 * Get preset by key
 */
export function getPreset(key: PresetKey) {
  return PRESETS_REGISTRY[key];
}

/**
 * List all available presets
 */
export function listPresets() {
  return Object.entries(PRESETS_REGISTRY).map(([key, preset]) => ({
    key,
    ...preset,
  }));
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: 'authentication' | 'api' | 'forms' | 'state' | 'ui') {
  const categoryMap: Record<string, PresetKey[]> = {
    authentication: ['authentication'],
    api: ['apiClient'],
    forms: ['formManagement'],
    state: ['stateManagementZustand', 'stateManagementRedux'],
    ui: ['button', 'input', 'modal', 'card'],
  };

  return (categoryMap[category] || []).map((key) => ({
    key,
    ...PRESETS_REGISTRY[key],
  }));
}
