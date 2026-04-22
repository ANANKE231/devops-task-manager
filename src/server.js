const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 DevOps Task Manager running on port ${PORT}`);
  console.log(`   Version: ${process.env.APP_VERSION || '1.0.0'}`);
  console.log(`   Env:     ${process.env.NODE_ENV || 'development'}`);
});
