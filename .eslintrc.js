module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'prettier'],
  rules: {
    // ── Regras de ESTILO rebaixadas para 'warn' ─────────────────────────────────────────────
    // Somam ~3345 ocorrências em 541 arquivos, acumuladas enquanto o `npm run lint` esteve
    // quebrado (o `.eslintrc.js` estendia 'prettier' sem o pacote instalado e o ESLint abortava
    // antes de rodar uma regra sequer). Todas são auto-corrigíveis, mas um `--fix` global geraria
    // um diff de 541 arquivos que enterraria qualquer correção de verdade — e reordenar imports
    // pode mudar ordem de efeito colateral. Como 'warn' continuam visíveis e o lint volta a servir
    // de porteiro para o que importa. A limpeza é PR própria.
    'jsx-a11y/alt-text': 'off',
    'react/display-name': 'off',
    'react/no-children-prop': 'off',
    '@next/next/no-img-element': 'off',
    '@next/next/no-page-custom-font': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // `^_` é a convenção para "existe de propósito, não é usado": parâmetro que precisa ficar na
    // assinatura, genérico exigido por um contrato, argumento posicional antes do que interessa.
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    'lines-around-comment': [
      'warn',
      {
        beforeBlockComment: true,
        beforeLineComment: true,
        allowBlockStart: true,
        allowObjectStart: true,
        allowArrayStart: true
      }
    ],
    'padding-line-between-statements': [
      'warn',
      {
        blankLine: 'any',
        prev: 'export',
        next: 'export'
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var'],
        next: '*'
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var']
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['function', 'multiline-const', 'multiline-block-like']
      },
      {
        blankLine: 'always',
        prev: ['function', 'multiline-const', 'multiline-block-like'],
        next: '*'
      }
    ],
    'newline-before-return': 'warn',
    'import/newline-after-import': [
      'warn',
      {
        count: 1
      }
    ],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index'], ['object', 'unknown']],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          },
          {
            pattern: 'next/**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '~/**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@/**',
            group: 'internal'
          }
        ],
        pathGroupsExcludedImportTypes: ['react', 'type'],
        'newlines-between': 'always-and-inside-groups'
      }
    ],
    // `@typescript-eslint/ban-types` foi REMOVIDO no v8 (temos 8.67) e dividido nas três regras
    // abaixo. Enquanto ficou aqui, o ESLint acusava "Definition for rule not found" UMA VEZ POR
    // ARQUIVO — 669 dos 4104 erros deste repositório eram só isso. Estas duas preservam a intenção
    // original (barrar `Function` e os wrappers `String`/`Number`/`Boolean`/`Symbol`/`Object`);
    // `no-empty-object-type` fica desligada porque a config antiga permitia `{}` de propósito.
    '@typescript-eslint/no-unsafe-function-type': 'error',
    '@typescript-eslint/no-wrapper-object-types': 'error',
    '@typescript-eslint/no-empty-object-type': 'off',

    // `import/named` não enxerga export de TIPO do TypeScript e acusava 25 falsos positivos
    // (`ColumnDef`, `DragEndEvent`, `UseFormReturn`...). Import inexistente de verdade já é pego
    // pelo `tsc --noEmit`, que roda limpo.
    'import/named': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      node: {},
      typescript: {
        project: './tsconfig.json'
      }
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', 'src/iconify-bundle/*'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
}
