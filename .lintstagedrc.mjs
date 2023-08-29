export default {
  '**/*.json': ['prettier -w'],
  '**/*.{mjs,cjs,js,jsx,ts,tsx,page}': ['eslint --fix', 'prettier -w'],
  'src/**/*.ts': ['vitest related --run'],
};
