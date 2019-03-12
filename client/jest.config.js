module.exports = {
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
  // Mock static asset imports (eg. `import imageSrc from '../image.png';`)
  // Static assets will import is empty strings during tests.
  moduleNameMapper: {
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__tests__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/src/__tests__/fileMock.js"
  },
  setupFilesAfterEnv: ['jest-enzyme'],
  testEnvironment: 'enzyme',
};
