module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    ".(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
  ],
};
