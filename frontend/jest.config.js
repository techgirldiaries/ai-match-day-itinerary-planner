const baseConfig = require("../.config/testing/jest.config.js");

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testTimeout: 10000,
  maxWorkers: "50%",
};
