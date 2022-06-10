module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/scripts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  restoreMocks: true,
  resetMocks: true,
  clearMocks: true
}
