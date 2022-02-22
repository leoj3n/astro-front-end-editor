import replace from 'replace-in-file';

const options = {
  files: './node_modules/astro/dist/core/create-vite.js',
  from: /return viteConfig;/g,
  to: 'if (typeof viteConfig.mergedConfigCallback === "function") { return viteConfig.mergedConfigCallback(viteConfig); }; return  viteConfig;',
};

try {
  let changedFiles = replace.sync(options);
}
catch (error) {
  console.error('Error occurred:', error);
}
