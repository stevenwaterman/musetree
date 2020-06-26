import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

const production = !process.env.ROLLUP_WATCH;

export default {
    input: "src/main.ts",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "public/build/bundle.js"
    },
    plugins: [
        svelte({
            dev: !production,
            css: css => {
                css.write("public/build/bundle.css");
            },
            preprocess: sveltePreprocess({
                typescript: {
                    transpileOnly: true
                }
            })
        }),

        resolve({
            browser: true,
            dedupe: ["svelte"]
        }),
        commonjs(),
        typescript(),

        !production && livereload("public"),
        production && terser()
    ],
};