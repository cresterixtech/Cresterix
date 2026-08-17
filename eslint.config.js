import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Build config runs in Node, not the browser.
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    /* The WebGL layer is imperative by design: three.js state lives
       outside React, and the per-frame loop must mutate the camera,
       the scene, live material uniforms and module-scope scratch
       vectors in place. Allocating fresh objects every frame to
       satisfy the compiler's model would cause GC churn at 60fps for
       no correctness benefit, and React never reads these values.

       ONE REAL HAZARD THIS RULE CATCHES — do not reintroduce it:
       mutating a `useMemo` result that is ALSO passed as a JSX prop.
       The React Compiler may duplicate such a value across memo
       blocks, so the render loop ends up writing to a different
       object than the one bound to the material. It fails silently:
       no error, the scene just renders black. That is exactly what
       happened with the crest field's uniforms.

       The safe pattern, used throughout this directory: build the
       initial object with useMemo, never write to it, and read the
       live object back off a ref (`matRef.current.uniforms`) inside
       useFrame.

       Scoped to this directory only — the rule stays on everywhere else. */
    files: ['src/three/**/*.{js,jsx}'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
])
