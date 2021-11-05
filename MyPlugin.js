const NodeTemplatePlugin = require("webpack/lib/node/NodeTemplatePlugin");
const NodeTargetPlugin = require("webpack/lib/node/NodeTargetPlugin");
const LoaderTargetPlugin = require("webpack/lib/LoaderTargetPlugin");
const LibraryTemplatePlugin = require("webpack/lib/LibraryTemplatePlugin");
const WebpackOptionsDefaulter = require("webpack/lib/WebpackOptionsDefaulter");
const ResolverFactory = require("webpack/lib/ResolverFactory");
const {cachedCleverMerge} = require("webpack/lib/util/cleverMerge");
const PLUGIN_NAME = "MyPlugin";

class MyPlugin {
  constructor(options) {
    this.options = new WebpackOptionsDefaulter().process({
      "entry": {...options.entry},
      "resolve": {...options.resolve},
      "target": "node",
    });
  }

  apply(compiler) {
    let childCompiler = null;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      childCompiler = compilation.createChildCompiler(PLUGIN_NAME);
      new NodeTemplatePlugin().apply(childCompiler);
      new NodeTargetPlugin().apply(childCompiler);
      new LoaderTargetPlugin("node").apply(childCompiler);
      new LibraryTemplatePlugin("", "commonjs2").apply(childCompiler);

      childCompiler.resolverFactory = new ResolverFactory();
      childCompiler.resolverFactory.hooks.resolveOptions.for("normal").tap(PLUGIN_NAME, (resolveOptions) => {
        resolveOptions = cachedCleverMerge(this.options.resolve, resolveOptions);
        resolveOptions.fileSystem = compilation.compiler.inputFileSystem;
        return resolveOptions;
      });
      childCompiler.resolverFactory.hooks.resolveOptions.for("context").tap(PLUGIN_NAME, (resolveOptions) => {
        resolveOptions = cachedCleverMerge(this.options.resolve, resolveOptions);
        resolveOptions.fileSystem = compilation.compiler.inputFileSystem;
        resolveOptions.resolveToContext = true;
        return resolveOptions;
      });
      childCompiler.resolverFactory.hooks.resolveOptions.for("loader").tap(PLUGIN_NAME, (resolveOptions) => {
        resolveOptions = cachedCleverMerge(this.options.resolveLoader, resolveOptions);
        resolveOptions.fileSystem = compilation.compiler.inputFileSystem;
        return resolveOptions;
      });

      const {entry} = this.options;
      const MultiEntryPlugin = require("webpack/lib/MultiEntryPlugin");
      if (!Array.isArray(entry) && typeof entry === "object") {
        for (const name of Object.keys(entry)) {
          new MultiEntryPlugin(
            compilation.compiler.context,
            Array.isArray(entry[name]) ? entry[name] : [entry[name]],
            name
          ).apply(childCompiler);
        }
      }
    });

    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      childCompiler.runAsChild((error, _entries, childCompilation) => {
        callback();
      });
    });
  }
}

module.exports = {
  MyPlugin
};