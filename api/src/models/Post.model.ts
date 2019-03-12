import { Model } from 'objection';
import User from './User.model';

export default class Post extends Model {
  static tableName = 'post';

  static jsonSchema = {
    type: 'object',
    required: ['title', 'content'],
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      creatorId: { type: 'integer' },
    },
  };

  static relationMappings = {
    creator: {
      relation: Model.BelongsToOneRelation,
      get modelClass() {
        return User;
      },
      join: {
        from: 'post.creator_id',
        to: 'user.id',
      },
    },
  };

  id!: number;
  title?: string;
  content?: string;
  creatorId?: number;
}
