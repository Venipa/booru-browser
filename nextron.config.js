module.exports = {
  webpack: (defaultConfig, env) =>
    Object.assign(defaultConfig, {
      entry: {
        background: "./main/background.ts",
        "download.worker": "./main/download.worker.ts",
      },
    }),
};
