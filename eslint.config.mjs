import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.output/**',
      '**/.nuxt/**',
      '**/coverage/**',
      // 舊站單檔 HTML(重構完成後移除)
      'index.html',
      'admin.html',
      'signup-form.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    // TypeScript 已檢查未定義識別字(含 Nuxt auto-imports);no-undef 對 TS/Vue 檔為誤報
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: { 'no-undef': 'off' },
  },
  {
    // Nuxt 慣例:pages/layouts/app.vue 依路由單字命名;全形空白(U+3000)為舊站原文排版
    files: ['apps/web/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-irregular-whitespace': 'off',
    },
  },
  {
    // 後台根元件 App.vue 為單字命名;文案原樣移植舊站 admin.html
    files: ['apps/admin/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-irregular-whitespace': 'off',
    },
  },
  prettier,
)
