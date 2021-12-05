/**
 * @type {import("next").NextConfig}
 */
const config = {
  webpack5: true,
  images: { domains: ["*"] },
  webpack: (config, { isServer, webpack }) => {
    console.log("Webpack Target: ", config.target);
    if (!isServer) {
      config.target = "electron-renderer";
      config.node = {
        __dirname: true,
      };
    }
    return config;
  },
};

const withTM = require("next-transpile-modules")(["@datorama/akita"]); // pass the modules you would like to see transpiled

module.exports = withTM(config);
