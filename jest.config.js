module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup/jest.setup.js"],
  moduleNameMapper: {
    // So we can easily mock your auth middleware path
    "^@middleware/(.*)$": "<rootDir>/middleware/$1",
    "^@models/(.*)$": "<rootDir>/models/$1",
    "^@routes/(.*)$": "<rootDir>/routes/$1"
  }
};
