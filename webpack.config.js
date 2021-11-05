const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const {MyPlugin} = require("./MyPlugin");

module.exports = (env, argv) => {
  return {
    "devtool": false,
    "entry": {
      "index.web": path.resolve(__dirname, "index.web")
    },
    "output": {
      "filename": "[name].[contenthash].js",
      "libraryTarget": "umd",
      "path": path.resolve(__dirname, "dist"),
      "publicPath": ""
    },
    "plugins": [
      new ESLintPlugin({
        "overrideConfigFile": path.resolve(__dirname, ".eslintrc.js"),
        "extensions": ["jsx", "mjs", "cjs", "js"],
        "fix": true
      }),
      new MyPlugin({
        "entry": {
          "index.node": path.resolve(__dirname, "index.node")
        },
        "resolve": {
          "extensions": [".cjs", ".jsx", ".js", ".mjs"],
        },
      })
    ],
  }
};
