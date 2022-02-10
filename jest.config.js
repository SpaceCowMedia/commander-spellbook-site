module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: true,
};
