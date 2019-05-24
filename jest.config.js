module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['dist'],
  roots: [
    '<rootDir>',
    '<rootDir>/benchmark/*',
    '<rootDir>/examples/*',
    '<rootDir>/packages/*',
  ],
  testPathIgnorePatterns: ['fixtures'],
};
