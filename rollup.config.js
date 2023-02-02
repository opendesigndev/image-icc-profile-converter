import typescript from '@rollup/plugin-typescript'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'

const resolveOptions = {
  moduleDirectories: ['node_modules', './wasm'],
}

const indexConfig = ({format, outputFile, declarations}) => ({
  input: 'src/index.ts',
  output: {
    format: format,
    file: outputFile,
    sourcemap: !declarations,
  },
  external: [],
  plugins: [
    nodeResolve({resolveOptions}),
    declarations ? dts() : typescript({sourceMap: true}),
  ],
})

export default [
  indexConfig({outputFile: 'dist/index.js', format: 'es'}),
  indexConfig({outputFile: 'dist/index.d.ts', declarations: true}),
]
