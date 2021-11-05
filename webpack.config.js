const path = require("path");
const {MyPlugin} = require("./MyPlugin");

module.exports = (env, argv) => {
  return {
    "devtool": false,
    "entry": {
      "index.web": path.resolve(__dirname, "index.web")
    },
    "module": {
      "rules": [
        {
          "enforce": "pre",
          "exclude": /node_modules/u,
          "loader": "eslint-loader",
          "options": {
            "configFile": path.resolve(__dirname, ".eslintrc.js"),
            "fix": true
          },
          "test": /\.(cjs|jsx|js|mjs)$/
        }
      ]
    },
    "output": {
      "filename": "[name].[contenthash].js",
      "libraryTarget": "umd",
      "path": path.resolve(__dirname, "dist"),
      "publicPath": ""
    },
    "plugins": [
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
