module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/__tests__/unit/**/*.test.ts'],
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
