module.exports = {
  expo: {
    name: 'WhatsChat',
    slug: 'whatschat',
    scheme: 'whatschat',
    version: '1.0.0',
    plugins: [
      [
        'expo-localization',
        {
          supportedLocales: ['en', 'zh', 'zh-Hans', 'zh-Hant'],
        },
      ],
    ],
  },
};
