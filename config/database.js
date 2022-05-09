module.exports = {
  "development": {
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASS,
    'database': process.env.DB_DATABASE || "express_mvc_development",
    'host': process.env.DB_HOST || "127.0.0.1",
    'port': process.env.DB_PORT || 5432,
    "dialect": process.env.DB_DIALECT || "postgres"
  },
  "test": {
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASS,
    'database': process.env.DB_DATABASE || "express_mvc_test",
    'host': process.env.DB_HOST || "127.0.0.1",
    'port': process.env.DB_PORT || 5432,
    "dialect": process.env.DB_DIALECT || "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
};
