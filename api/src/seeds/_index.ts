export default () =>
  Promise.all([import('./1_createUsers.seed'), import('./2_createPosts.seed')]);
