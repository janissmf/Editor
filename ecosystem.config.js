module.exports = {
  apps: [
    {
      name: 'api',
      script: 'server/index.js',
      env: {
        PORT: 5001,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'app',
      script: 'node_modules/.bin/vite',
      args: 'preview --port 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};