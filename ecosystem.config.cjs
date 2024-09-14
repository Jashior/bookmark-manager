module.exports = {
  apps: [
    {
      name: 'bookmark-manager',
      script: './server.js',
      watch: false,
      force: true,
      env: {
        PORT: 3132,
        NODE_ENV: 'production',
      },
    },
  ],
};
