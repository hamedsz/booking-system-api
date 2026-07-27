const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
};
const { REDIS_PASSWORD } = process.env;

if (REDIS_PASSWORD) {
  redisConfig.password = REDIS_PASSWORD;
}

export default redisConfig;
