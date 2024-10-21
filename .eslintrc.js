module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: './',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js', '^_'],
    // rules: {
    //     'linebreak-style': 'off',
    //     '@typescript-eslint/no-explicit-any': 'off',
    //     '@typescript-eslint/interface-name-prefix': 'off',
    //     '@typescript-eslint/explicit-function-return-type': 'off',
    //     '@typescript-eslint/explicit-module-boundary-types': 'off',
    // },
    rules: {
        'import/no-default-export': 'warn',
        'import/no-named-as-default': 'warn',
    },
};
