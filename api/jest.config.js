module.exports = {
  globals: {
    "ts-jest": {
      compiler: 'ttypescript'
    }
  },
  roots: [
    '<rootDir>/src',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '/__tests__/.*\\.test\\.tsx?$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  modulePaths: [
    '.'
  ],
  testEnvironment: 'node',
};
