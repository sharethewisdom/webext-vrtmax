module.exports = {
  verbose: true,
  build: {
    overwriteDest: true,
  },
  sourceDir: "./src",
  run: {
    firefox: "release",
    startUrl: ["https://www.vrt.be/vrtnu/livestream/video/een"],
  },
};
