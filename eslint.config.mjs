// SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled.
// Change all copies together (see .claude/rules/git-workflow.md).
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';

const JS_FILES = ['scripts/**/*.js'];
const TS_FILES = ['src/**/*.ts'];
const MJS_FILES = ['*.mjs'];

// TypeScript rules are enabled only when a tsconfig.json sits next to this config.
// typescript-eslint is imported lazily so JS-only repos do not need it installed.
const hasTypeScript = existsSync(new URL('./tsconfig.json', import.meta.url));

const FOUNDRY_GLOBALS = Object.fromEntries(
    [
        'game',
        'canvas',
        'ui',
        'CONFIG',
        'CONST',
        'Hooks',
        'foundry',
        'Handlebars',
        'fromUuid',
        'fromUuidSync',
    ].map((name) => [name, 'readonly']),
);

const restrictGlobal = (name, message) => ({ name, message });

const JQUERY_MESSAGE =
    'jQuery is banned by project rule (.claude/rules/foundry-api.md "No jQuery"). Use DOM APIs (querySelector, addEventListener).';

const RESTRICTED_GLOBALS = [
    restrictGlobal('$', JQUERY_MESSAGE),
    restrictGlobal('jQuery', JQUERY_MESSAGE),
    restrictGlobal(
        'Application',
        'Deprecated ApplicationV1 global. Use foundry.applications.api.ApplicationV2.',
    ),
    restrictGlobal(
        'FormApplication',
        'Deprecated ApplicationV1 global. Use foundry.applications.api.ApplicationV2 (HandlebarsApplicationMixin).',
    ),
    restrictGlobal(
        'DocumentSheet',
        'Deprecated ApplicationV1 global. Use foundry.applications.api.DocumentSheetV2.',
    ),
    restrictGlobal(
        'Dialog',
        'Deprecated ApplicationV1 global. Use foundry.applications.api.DialogV2.',
    ),
    restrictGlobal(
        'renderTemplate',
        'Deprecated global. Use foundry.applications.handlebars.renderTemplate.',
    ),
    restrictGlobal(
        'loadTemplates',
        'Deprecated global. Use foundry.applications.handlebars.loadTemplates.',
    ),
    restrictGlobal(
        'getTemplate',
        'Deprecated global. Use foundry.applications.handlebars.getTemplate.',
    ),
    restrictGlobal(
        'TextEditor',
        'Deprecated global. Use foundry.applications.ux.TextEditor.implementation.',
    ),
    restrictGlobal('mergeObject', 'Deprecated global. Use foundry.utils.mergeObject.'),
    restrictGlobal('duplicate', 'Deprecated global. Use foundry.utils.duplicate.'),
    restrictGlobal('getProperty', 'Deprecated global. Use foundry.utils.getProperty.'),
    restrictGlobal('setProperty', 'Deprecated global. Use foundry.utils.setProperty.'),
    restrictGlobal('randomID', 'Deprecated global. Use foundry.utils.randomID.'),
];

const HTML_SINK_HINT =
    'Use textContent, replaceChildren() (to clear), DOM construction (createElement), or a Handlebars {{ }} template.';

const RESTRICTED_SYNTAX = [
    {
        selector:
            "AssignmentExpression[left.type='MemberExpression'][left.property.name=/^(innerHTML|outerHTML)$/]",
        message: `Assigning innerHTML/outerHTML is banned (XSS). ${HTML_SINK_HINT}`,
    },
    {
        selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
        message: `insertAdjacentHTML is banned (XSS). ${HTML_SINK_HINT}`,
    },
    {
        selector:
            "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
        message: `document.write is banned (XSS). ${HTML_SINK_HINT}`,
    },
    {
        selector: "MemberExpression[object.name='foundry'][property.name='appv1']",
        message:
            'foundry.appv1 is the deprecated ApplicationV1 API. Use foundry.applications.api.* (ApplicationV2).',
    },
];

const sharedRules = {
    'no-console': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-restricted-globals': ['error', ...RESTRICTED_GLOBALS],
    'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX],
    '@eslint-community/eslint-comments/require-description': 'error',
    '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
};

const config = [
    { ignores: ['dist/', 'node_modules/'] },
    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
    {
        ...js.configs.recommended,
        files: [...JS_FILES, ...MJS_FILES],
    },
    {
        files: JS_FILES,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser, ...FOUNDRY_GLOBALS },
        },
        rules: { 'no-unused-vars': 'error' },
    },
    {
        files: MJS_FILES,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.node },
        },
        rules: { 'no-unused-vars': 'error' },
    },
];

if (hasTypeScript) {
    const { default: tseslint } = await import('typescript-eslint');
    config.push(
        { ...js.configs.recommended, files: TS_FILES },
        ...tseslint.configs.recommendedTypeChecked.map((entry) => ({
            ...entry,
            files: TS_FILES,
        })),
        {
            files: TS_FILES,
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
                },
            },
            rules: {
                'no-unused-vars': 'off',
                '@typescript-eslint/no-unused-vars': 'error',
            },
        },
    );
}

config.push({
    files: [...JS_FILES, ...(hasTypeScript ? TS_FILES : []), ...MJS_FILES],
    plugins: { '@eslint-community/eslint-comments': eslintComments },
    rules: sharedRules,
});

export default config;
