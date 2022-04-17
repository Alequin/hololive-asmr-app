const exclusionList = require("metro-config/src/defaults/exclusionList");

module.exports = {
  resolver: {
    // Exclude files from the final app bundle
    blacklistRE: exclusionList([/.*assets\/raw-images.*/, /.*test.js/]),
  },
};
