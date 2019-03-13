import Router from '../_core/Router';

export default new Router().post('/user', async context => {
  const result = await context.actions.createUser(context.request.body);

  context.response.status = 200;
  context.response.body = {
    result,
  };
});
