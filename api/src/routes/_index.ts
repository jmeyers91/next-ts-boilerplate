import Router from '../Router';
import userRouter from './user.router';

export default new Router()
  .prefix('/api')
  .use(userRouter.routes())
  .use(userRouter.allowedMethods())
  .get('/foo', context => {
    context.response.body = { bar: 'fizz' };
  });
