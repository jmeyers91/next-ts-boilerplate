import path from 'path';
import typescriptPlugin from 'rollup-plugin-typescript2';

// TTypescript is a thin wrapper around tsc that enables using custom transforms in tsconfig.
// Needed to pre-compile typescript-is validation functions using compile-time types.
import ttypescript from 'ttypescript';

const tsconfig = path.resolve(__dirname, 'tsconfig.json');
const srcPath = path.resolve(__dirname, 'src');
const distPath = path.resolve(__dirname, 'dist');

/**
 * Creates a rollup entry point. All entries should be located in src/entries.
 */
const entry = filename => ({
  input: path.join(srcPath, 'entries', filename),
  output: {
    dir: distPath,
    format: 'cjs',
  },
  plugins: [
    typescriptPlugin({
      typescript: ttypescript,
      tsconfig,
    }),
  ],
  /**
   * Hide "external dependency", "circular dependency", and unused "typescript-is" import warnings.
   * Reasons:
   *  - No need to bundle server-side dependencies.
   *  - Circular dependencies between models is expected and should be handled with lazy evaluation.
   *  - Typescript-is function calls are pre-compiled away resulting in the unused import warning.
   */
  onwarn(event) {
    if(!event || !event.message) {
      return;
    }
    if(
      event.code === 'UNRESOLVED_IMPORT' ||
      (event.code === 'UNUSED_EXTERNAL_IMPORT' && event.source === 'typescript-is') ||
      (event.code === 'CIRCULAR_DEPENDENCY' && event.importer && event.importer.endsWith('.model.ts'))
    ) {
      return;
    }
    console.error(event.code, event.importer, event.message)
  },
});

export default [
  entry('start.ts'),
  entry('migrate.ts'),
  entry('seed.ts'),
];
