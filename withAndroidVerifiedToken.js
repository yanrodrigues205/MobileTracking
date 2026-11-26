const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAndroidVerifiedToken(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const filePath = path.join(config.modRequest.projectRoot, 'android', 'app', 'src', 'main', 'assets', 'adi-registration.properties');
      const assetsDir = path.dirname(filePath);

      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const token = "DUZS4GRJFWU74AAAAAAAAAAAAA"; 
      
      fs.writeFileSync(filePath, token);
      console.log('✅ Token de verificação injetado em: ' + filePath);
      return config;
    },
  ]);
};
