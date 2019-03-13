import path from 'path';
import typescriptPlugin from 'rollup-plugin-typescript2';
import includePaths from 'rollup-plugin-includepaths';

// TTypescript is a thin wrapper around tsc that enables using custom transforms in tsconfig.
// Needed for typescript-is library.
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
  sourceMap: true,
  plugins: [
    typescriptPlugin({
      typescript: ttypescript,
      tsconfig,
    }),
    // includePaths({
    //   paths: srcPath,
    //   extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // }),
  ],
  onwarn(message) {
    /**
     * Hide "external dependency" warning.
     * We're currently not bundling dependencies because it's not necessary in
     * Node apps, and will probably cause issues with dependencies that have a
     * native compile step.
     */
    if (/external dependency/.test( message )){
      return;
    }
    console.error(message);
  },
});

export default [
  entry('start.ts'),
  entry('migrate.ts'),
  entry('seed.ts'),
];
