export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!uuid)"
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/utils/ip.utils.js",
    "src/validations/auth.validation.js",
    "src/controllers/auth.controller.js",
    "src/services/auth.service.js"
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  }
};
