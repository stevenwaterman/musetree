import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

// Unclear why, but importing this failes.
const svelteConfig = require("./svelte.config"); // eslint-disable-line

const production = !process.env.ROLLUP_WATCH;

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
    input: "src/main.js",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "public/bundle.js"
    },
    plugins: [
        svelte({
            // enable run-time checks when not in production
            dev: !production,
            // we'll extract any component CSS out into
            // a separate file — better for performance
            css: css => {
                css.write("public/bundle.css");
            },
            // Add shared config like preprocessors.
            ...svelteConfig
        }),

        // node_modules
        resolve({
            extensions,
            browser: true,
            dedupe: importee =>
                importee === "svelte" || importee.startsWith("svelte/")
        }),
        commonjs({
            namedExports: {
                "node_modules/humps/humps.js": ["camelizeKeys"]
            }
        }),
        babel({ extensions, exclude: "node_modules/**" }),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload("public"),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};