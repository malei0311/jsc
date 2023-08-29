import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/tests/**/*.test.?(c|m)[jt]s?(x)'],
    coverage: {
      // NOTE: v8 处理 ts 的类型和环境变量的分支覆盖率有问题，切成 istanbul
      provider: 'istanbul',
      all: true,
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.ts'],
      exclude: [...(configDefaults.coverage.exclude || [])],
    },
  },
});
