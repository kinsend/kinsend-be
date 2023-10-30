module.exports = {
    maxWorkers: 2,
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    roots: [
        "./src",
        "./test/integration"
    ],
    globalSetup: "<rootDir>/test/integration/globalSetup.ts",
    globalTeardown: "<rootDir>/test/integration/globalTeardown.ts",
    testRegex: "test\/integration\/.*\\.spec\\.ts$",
    testTimeout: 20000,
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    transformIgnorePatterns: [
        "/node_modules/(?!(swiper|ssr-window|dom7|rich-textarea)/)"
    ],
    moduleNameMapper: {
        "^axios$": "axios/dist/node/axios.cjs"
    },
    collectCoverageFrom: [
        "<rootDir>/src/**/*.{js,jsx,ts,tsx}",
        "!<rootDir>/node_modules/"
    ],
    coverageDirectory: "<rootDir>/build/coverage/integration",
    // TODO: Enable when we reach some reasonable threshold.
    // coverageThreshold: {
    //     global: {
    //         lines: 80,
    //         statements: 80
    //     }
    // },
    testEnvironment: "node",
    reporters: [
        "default",
        ['jest-junit', {outputDirectory: '<rootDir>/build/reports/', outputName: 'report-integration.xml'}],
    ]
}