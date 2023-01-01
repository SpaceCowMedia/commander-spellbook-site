module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: true,
};
