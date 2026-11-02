import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

// TypeScript performs module resolution; Prettier is the single source of stylistic formatting.
export default tseslint.config(
    { ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**', 'runtime/**', '**/logs/**', '**/storage/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            // Respect framework callbacks and React PascalCase components.
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
                { selector: 'function', format: ['camelCase', 'PascalCase'] },
                { selector: 'typeLike', format: ['PascalCase'] },
            ],
        },
    },
    prettier
)
