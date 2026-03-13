const { join } = require('path');

/**
 * Configuration Puppeteer pour Render.com
 * Le cache par défaut (~/.cache/puppeteer) n'est pas conservé entre build et runtime sur Render.
 * On stocke Chrome dans le projet pour qu'il soit inclus dans le déploiement.
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
