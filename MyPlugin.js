const webpack = require("webpack");
const ResolverFactory = require("webpack/lib/ResolverFactory");
const PLUGIN_NAME = "MyPlugin";

class MyPlugin {
  constructor(options) {
    this.options = webpack.config.getNormalizedWebpackOptions({
      "entry": {...options.entry},
      "resolve": {...options.resolve},
      "target": "node",
    });
    webpack.config.applyWebpackOptionsDefaults(this.options);
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      let childCompiler = compilation.createChildCompiler(PLUGIN_NAME);
      new webpack.node.NodeTemplatePlugin().apply(childCompiler);
      new webpack.node.NodeTargetPlugin().apply(childCompiler);
      new webpack.library.EnableLibraryPlugin("commonjs2").apply(childCompiler);
      new webpack.LoaderTargetPlugin("node").apply(childCompiler);

      childCompiler.resolverFactory = new ResolverFactory();
      childCompiler.resolverFactory.hooks.resolveOptions.for("normal").tap(PLUGIN_NAME, (resolveOptions) => {
        resolveOptions = webpack.util.cleverMerge(this.options.resolve, resolveOptions);
        resolveOptions.fileSystem = compilation.compiler.inputFileSystem;
        return resolveOptions;
      });
      childCompiler.resolverFactory.hooks.resolveOptions.for("context").tap(PLUGIN_NAME, (resolveOptions) => {
        resolveOptions = webpack.util.cleverMerge(this.options.resolve, resolveOptions);
        resolveOptions.fileSystem = compilation.compiler.inputFileSystem;
        resolveOptions.resolveToContext = true;
        return resolveOptions;
      });
      childCompiler.resolverFactory.hooks.resolveOptions.for("loader").tap(PLUGIN_NAME, (resolveOptions) => {
        resolveOptions = webpack.util.cleverMerge(this.options.resolveLoader, resolveOptions);
        resolveOptions.fileSystem = compilation.compiler.inputFileSystem;
        return resolveOptions;
      });

      childCompiler.options.output.library = {
        ...childCompiler.options.output.library,
        "name": "",
        "type": this.type,
      };
      webpack.EntryOptionPlugin.applyEntryOption(childCompiler, compilation.compiler.context, this.options.entry);

      compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
        childCompiler.runAsChild((error, _entries, childCompilation) => {
          callback();
        });
      });
    });
  }
}

module.exports = {
  MyPlugin
};