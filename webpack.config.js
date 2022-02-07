const path = require("path");

module.exports = {
  entry: "./build/main.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "mf.js",
  },
};
