'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('reflect-metadata');
var objection = require('objection');
var Knex = _interopDefault(require('knex'));
var path = _interopDefault(require('path'));
var dotenv = _interopDefault(require('dotenv'));

/**
 * Runs the passed knex migrations.
 *
 * @param knex - The knex instance to use to run the migrations.
 * @param migrations - The array of migrations to run.
 * @returns A promise that resolves the knex migration result [migrationCount, migrationNames[]]
 */
async function migrateLatest(knex, migrations) {
    const migratorConfig = {
        migrationSource: new MigrationSource(knex, migrations),
    };
    return await knex.migrate.latest(migratorConfig);
}
/**
 * Creates a migration function that drops `tableName` if it exists.
 *
 * @param tableName - Name of the table to drop.
 * @returns Knex migration down function.
 */
function downTable(tableName) {
    return async function migrationDown(knex) {
        return knex.schema.dropTableIfExists(tableName);
    };
}
/**
 * Creates a migration function that creates `tableName` if it doesn't exist
 * using the `buildTable` function to define columns and relations.
 *
 * @param tableName - Name of the table to be created.
 * @param buildTable - Table builder function for adding columns.
 */
function upTable(tableName, buildTable) {
    return async function migrationUp(knex) {
        if (!(await knex.schema.hasTable(tableName))) {
            await knex.schema.createTable(tableName, buildTable);
        }
    };
}
class MigrationSource {
    constructor(knex, migrations) {
        this.knex = knex;
        this.migrations = migrations;
    }
    getMigrations() {
        return Promise.resolve(this.migrations);
    }
    getMigrationName(migration) {
        return migration.name;
    }
    getMigration(migration) {
        const { knex } = this;
        const config = Object.assign({ disableTransactions: knex.client.config.client === 'sqlite3' }, migration.config);
        return Object.assign({}, migration, { config });
    }
}

const name = '20190212182006_create_user_table';
const up = upTable('user', t => {
    t.increments('id').primary();
    t.timestamps(true, true);
    t.string('email')
        .notNullable()
        .unique();
    t.string('password').notNullable();
    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
});
const down = downTable('user');

var create_user_table = /*#__PURE__*/Object.freeze({
  name: name,
  up: up,
  down: down
});

const name$1 = '20190212182007_create_post_table';
const up$1 = upTable('post', t => {
    t.increments('id').primary();
    t.timestamps(true, true);
    t.string('title').notNullable();
    t.string('content').notNullable();
    t.integer('creator_id')
        .references('id')
        .inTable('user')
        .onDelete('SET NULL');
});
const down$1 = downTable('post');

var create_post_table = /*#__PURE__*/Object.freeze({
  name: name$1,
  up: up$1,
  down: down$1
});

const migrations = [create_user_table, create_post_table];

class User extends objection.Model {
}
User.tableName = 'user';
User.jsonSchema = {
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
User.relationMappings = {
    posts: {
        relation: objection.Model.HasManyRelation,
        get modelClass() {
            return Post;
        },
        join: {
            from: 'user.id',
            to: 'post.creator_id',
        },
    },
};

class Post extends objection.Model {
}
Post.tableName = 'post';
Post.jsonSchema = {
    type: 'object',
    required: ['title', 'content'],
    properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        creatorId: { type: 'integer' },
    },
};
Post.relationMappings = {
    creator: {
        relation: objection.Model.BelongsToOneRelation,
        get modelClass() {
            return User;
        },
        join: {
            from: 'post.creator_id',
            to: 'user.id',
        },
    },
};

const models = {
    Post,
    User,
};
/**
 * Binds the passed knex instance to each models and returns them.
 *
 * @params knex - The knex instance to bind the models to. Knex transactions can also be passed.
 * @returns A model class index object. Keys are model names, values are model classes
 */
function getBoundModels(knex) {
    const boundModels = {};
    for (const key in models) {
        if (models.hasOwnProperty(key)) {
            boundModels[key] = models[key].bindKnex(knex);
        }
    }
    return boundModels;
}

/**
 * API root directory containing package.json, tsconfig.json, etc.
 */
const rootDir = path.resolve(__dirname, '..');
// Allow project level env variables to be defined in /api/.env
dotenv.config({
    path: path.join(rootDir, '.env'),
});
/**
 * Whether or not the server is running in development mode.
 */
const isDev = process.env.NODE_ENV === 'development';
/**
 * Whether or not the server is running in a test.
 */
const isTest = process.env.NODE_ENV === 'test';
/**
 * Port used by the webserver.
 */
const port = parseInt(process.env.PORT || '8080', 10);
/**
 * Database files are all stored in the API root directory and are named using NODE_ENV.
 * eg.
 *   production database is /api/production.sqlite3
 *   development database is /api/development.sqlite3
 *   test database is /api/test.sqlite3
 */
const databaseFilepath = path.join(rootDir, `${process.env.NODE_ENV}.sqlite3`);
/**
 * The database connection config used by knex.
 */
const knexConfig = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: databaseFilepath,
    },
};

let cachedKnex;
/**
 * Returns the base knex instance for the app.
 * The knex instance is cached.
 */
function getDefaultKnex() {
    if (!cachedKnex) {
        cachedKnex = Knex(knexConfig);
    }
    return cachedKnex;
}

/** Needed because knex always throws during a transaction rollback */
const IGNORE_ERROR = Symbol('IGNORE_ERROR');
/**
 * The Db class should be the common interface used to access the database.
 *
 * @param knex The knex instance.
 * @property models - An
 */
class Db {
    /**
     * Get the singleton database.
     *
     * @returns Db instance
     */
    static getDefault() {
        if (!this.singleton) {
            this.singleton = new Db(getDefaultKnex());
        }
        return this.singleton;
    }
    constructor(knex) {
        this.knex = knex;
        this.models = getBoundModels(knex);
    }
    /**
     * Runs the transaction body in a knex transaction and commits if it succeeds and rolls back
     * if it fails.
     *
     * @params transactionBody - The function that receives the transaction db.
     * @returns The return value of the transaction body.
     */
    async startTransaction(transactionBody) {
        return await this.knex.transaction(trx => {
            Promise.resolve()
                .then(() => transactionBody(new Db(trx)))
                .then(result => trx.commit(result))
                .catch(error => trx.rollback(error));
        });
    }
    /**
     * Runs the transaction body in a knex transaction and rolls back the database
     * when it finishes.
     *
     * @params transactionBody - The function that receives the transaction db.
     * @returns The return value of the transaction body.
     */
    async startTestTransaction(transactionBody) {
        const { knex } = this;
        let result;
        try {
            await knex.transaction(trx => {
                Promise.resolve()
                    .then(() => transactionBody(new Db(trx)))
                    .then(r => {
                    result = r;
                    return trx.rollback(IGNORE_ERROR);
                })
                    .catch(error => trx.rollback(error));
            });
        }
        catch (error) {
            if (error !== IGNORE_ERROR) {
                throw error;
            }
        }
        return result;
    }
    /**
     * Returns a test run body that receives a transaction db instance as an argument.
     * Used to reduce boilerplate when running tests in transactions.
     *
     * @params testBody - The test body function. Receives a db instance.
     * @returns A test function intended to be passed to `it` or `test`.
     *
     * @example
     *
     * ```ts
     * const baseDb = Db.getDefault();
     *
     * beforeAll(() => runMigrations(baseDb));
     * afterAll(() => baseDb.knex.destroy());
     *
     * describe('posts', () => {
     *  test('Should be able to create a post', baseDb.test(async db => {
     *    const { Post } = db.models;
     *    // this insert will be rolled back after the test
     *    await Post.query().insert({ title: 'unique title', content: 'test content' });
     *  }));
     * });
     * ```
     */
    test(testBody) {
        return async () => {
            await this.startTestTransaction(testBody);
        };
    }
    /**
     * Disconnect from the database.
     *
     * @returns A promise
     */
    async destroy() {
        return await this.knex.destroy();
    }
}

/**
 * Log functions that won't cause tslint errors.
 * Use these for logs that should exists in production.
 * Use `console.log` for debugging (tslint will ensure we remove them before committing).
 */
var log = /* tslint:disable */ console.log.bind(console) /* tslint:enable */;
const logError = /* tslint:disable */ console.error.bind(console) /* tslint:enable */;
const time = /* tslint:disable */ console.time.bind(console) /* tslint:enable */;
const timeEnd = /* tslint:disable */ console.timeEnd.bind(console) /* tslint:enable */;

/**
 * Entry point for running database migrations.
 */
/**
 * Run API server database migrations exported from `src/migrations/_index`
 */
async function runMigrations(db) {
    return migrateLatest(db.knex, migrations);
}
// If called directly (node dist/migrate.js), run migrations using the default knex instance.
if (require.main === module) {
    (async () => {
        log('Running migrations');
        const db = Db.getDefault();
        const results = await runMigrations(db);
        const names = results[1];
        if (names.length) {
            log(names.map(s => '  ' + s).join('\n'));
        }
        log('Done');
        await db.knex.destroy();
    })();
}

module.exports = runMigrations;
