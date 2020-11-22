import typescript from '@rollup/plugin-typescript'
import { terser } from "rollup-plugin-terser"

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/heartlight.esm.js',
            format: 'es'
        },
        {
            file: 'dist/heartlight.cjs.js',
            format: 'cjs',
            exports: 'default'
        },
        {
            file: 'dist/heartlight.min.js',
            format: 'iife',
            name: 'heartlight'
        }
    ],
    plugins: [typescript(), terser()]
}