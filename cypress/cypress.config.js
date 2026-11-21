const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 1600,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    retries: 0,
  },
})
