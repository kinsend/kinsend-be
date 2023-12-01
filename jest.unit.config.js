/** @type {import('jest').Config} */
const config = {
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    roots: [
        "./src",
        "./test/unit"
    ],
    testRegex: "test\/unit\/.*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    moduleNameMapper: {
        "^axios$": "axios/dist/node/axios.cjs"
    },
    collectCoverageFrom: [
        "!<rootDir>/node_modules/",
        "<rootDir>/src/**/*.{js,jsx,ts,tsx}",
    ],
    coverageDirectory: "<rootDir>/build/coverage/unit",
    // TODO: Enable when we reach some reasonable threshold.
    // coverageThreshold: {
    //     global: {
    //         lines: 80,
    //         statements: 80
    //     }
    // },

    testEnvironment: "node",

    reporters: [
        'default',
        ['jest-junit', {outputDirectory: '<rootDir>/build/reports/', outputName: 'report-unit.xml'}],
    ]
};

module.exports = config