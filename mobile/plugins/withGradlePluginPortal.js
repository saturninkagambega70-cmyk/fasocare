const { withSettingsGradle } = require('expo/config-plugins');

function withGradlePluginPortal(config) {
  return withSettingsGradle(config, (config) => {
    const content = config.modResults.contents;
    if (content.includes('gradlePluginPortal()')) {
      return config;
    }
    const newContent = content.replace(
      'pluginManagement {',
      `pluginManagement {
  repositories {
    gradlePluginPortal()
    google()
    mavenCentral()
  }`
    );
    config.modResults.contents = newContent;
    return config;
  });
}

module.exports = withGradlePluginPortal;
