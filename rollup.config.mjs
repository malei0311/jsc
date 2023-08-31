import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import progress from 'rollup-plugin-progress';
import filesize from 'rollup-plugin-filesize';

const envInput = process.env.INPUT_FILE;

function buildJS(input, output, format) {
  const defaultOutputConfig = {
    format,
    // sourcemap: true,
  };

  const esOutputConfig = {
    ...defaultOutputConfig,
    file: output,
  };
  const cjsOutputConfig = {
    ...defaultOutputConfig,
    file: output,
  };

  const config = {
    input,
    output: [format === 'es' ? esOutputConfig : cjsOutputConfig],
    plugins: [
      progress(),
      typescript(),
      filesize({
        showMinifiedSize: false,
      }),
    ],
  };

  return config;
}

export default [
  buildJS(envInput, 'lib/index.cjs', 'cjs'),
  buildJS(envInput, 'lib/index.mjs', 'es'),
  {
    input: 'lib/dts/index.d.ts',
    output: [{ file: 'lib/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
