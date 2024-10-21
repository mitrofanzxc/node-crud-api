module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    moduleDirectories: ['<rootDir>/src', '<rootDir>/node_modules'],
    restoreMocks: true,
    resetMocks: true,
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
};
