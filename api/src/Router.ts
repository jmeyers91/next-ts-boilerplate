import BaseRouter from 'koa-router';
import { CustomContext } from './Context';

export default class extends BaseRouter<any, CustomContext> {}
