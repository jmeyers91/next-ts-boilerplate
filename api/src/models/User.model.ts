import { Model } from 'objection';
import Post from './Post.model';

export default class User extends Model {
  static tableName = 'user';

  static jsonSchema = {
    type: 'object',
    required: ['email', 'password', 'firstName', 'lastName'],
    properties: {
      email: { type: 'string', unique: true },
      password: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };

  static relationMappings = {
    posts: {
      relation: Model.HasManyRelation,
      get modelClass() {
        return Post;
      },
      join: {
        from: 'user.id',
        to: 'post.creator_id',
      },
    },
  };

  id!: number;
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  createdAt!: string;
  updatedAt!: string;
  posts?: Post[];
}
