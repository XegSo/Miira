import globals from 'globals';
import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js'


export default [
    {
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            // Use 4 space indentations and disallow tabs.
            '@stylistic/js/indent': ['error', 4],
            '@stylistic/js/no-tabs': 'error',
            '@stylistic/js/no-mixed-spaces-and-tabs': 'error',

            // Use single quotes as much as possible.
            '@stylistic/js/quotes': ['error', 'single'],

            // Require semicolons where needed.
            '@stylistic/js/semi': 'error',
            '@stylistic/js/semi-spacing': 'error',
            '@stylistic/js/no-extra-semi': 'error',

            // Only one statement per line.
            '@stylistic/js/max-statements-per-line': 'error',

            // Require a newline at the end of files.
            '@stylistic/js/eol-last': 'error',

            '@stylistic/js/dot-location': ['error', 'property'],
            '@stylistic/js/brace-style': 'error',
            '@stylistic/js/keyword-spacing': 'error',
            '@stylistic/js/object-curly-spacing': ['error', 'always'],
            '@stylistic/js/key-spacing': 'error',
            '@stylistic/js/function-call-spacing': 'error',

            // Keep consistent comma style.
            '@stylistic/js/comma-spacing': 'error',
            '@stylistic/js/comma-dangle': 'error',
            '@stylistic/js/comma-style': 'error',

            '@stylistic/js/new-parens': 'error',
            '@stylistic/js/arrow-spacing': 'error',
            '@stylistic/js/array-bracket-spacing': 'error',
            '@stylistic/js/space-in-parens': 'error',
            '@stylistic/js/spaced-comment': 'error',
            '@stylistic/js/switch-colon-spacing': 'error',
            '@stylistic/js/computed-property-spacing': 'error',
            '@stylistic/js/block-spacing': 'error',
            '@stylistic/js/no-multi-spaces': 'error',
            '@stylistic/js/no-trailing-spaces': 'error',
            '@stylistic/js/no-whitespace-before-property': 'error',
            '@stylistic/js/rest-spread-spacing': 'error',
            '@stylistic/js/space-before-blocks': 'error',
            '@stylistic/js/template-curly-spacing': 'error',
            '@stylistic/js/template-tag-spacing': 'error',
            '@stylistic/js/space-infix-ops': 'error',
            '@stylistic/js/space-unary-ops': 'error',
            '@stylistic/js/space-before-function-paren': ['error', {
                'anonymous': 'always',
                'named': 'never',
                'asyncArrow': 'always'
            }]
        },
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs'
        }
    },
    {
        languageOptions: {
            globals: globals.node
        }
    },
    pluginJs.configs.recommended,
    {
        // Disable some rules from the recommended set.
        rules: {
            'no-irregular-whitespace': 'off'
        }
    }
];
