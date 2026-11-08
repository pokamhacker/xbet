// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure all media extensions are included in assetExts
const additionalAssetExts = ['mp4', 'webm', 'wav', 'mp3', 'png', 'jpg', 'jpeg', 'gif', 'svg'];
additionalAssetExts.forEach((ext) => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

module.exports = config;

