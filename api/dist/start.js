'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('reflect-metadata');
var path = _interopDefault(require('path'));
var dotenv = _interopDefault(require('dotenv'));
var objection = require('objection');
var Knex = _interopDefault(require('knex'));
var Koa = _interopDefault(require('koa'));
var KoaBodyparser = _interopDefault(require('koa-bodyparser'));
var koaHelmet = _interopDefault(require('koa-helmet'));
var jwtMiddleware = _interopDefault(require('koa-jwt'));
var BaseRouter = _interopDefault(require('koa-router'));
var chalk = _interopDefault(require('chalk'));
require('typescript-is');

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
 * Whether or not to do runtime validation on action results. Useful for catching bugs during
 * development/tests, but should (probably) be disabled in production.
 */
const validateActionResults = isDev || isTest;
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

class Router extends BaseRouter {
}

const styleStatus = process.env.NODE_ENV === 'development' ? styleStatusDev : styleStatusProd;
/**
 * Creates a Koa middleware for logging requests/responses and handling errors.
 *
 * @returns Koa middleware function.
 */
function createErrorMiddleware() {
    return async function errorMiddleware(context, next) {
        const { request, response } = context;
        try {
            await next();
            /* tslint:disable */
            console.log(styleStatus(response.status), request.method, request.path);
            /* tslint:enable */
        }
        catch (error) {
            const status = error.status || 400;
            /* tslint:disable */
            console.log(styleStatus(status), request.method, request.path, error.stack || error.message);
            /* tslint:enable */
            context.response.status = status;
            context.response.body = {
                success: false,
                status,
                error: {
                    message: error.message,
                    data: error.errors || undefined,
                },
            };
        }
    };
}
// >= 500 red, >= 400 yellow, 0-399 green
function styleStatusDev(status) {
    const statusString = '' + status;
    if (status >= 500) {
        return chalk.red(statusString);
    }
    if (status >= 400) {
        return chalk.yellow(statusString);
    }
    return chalk.green(statusString);
}
// No colors in production
function styleStatusProd(status) {
    return '' + status;
}

/**
 * Actions are thin wrappers around functions with support for run-time input and result validation.
 * The generic types Props and Result correspond to the function's expected props and result types.
 */
class Action {
    /**
     * Create a new action.
     *
     * @param fn - The body of the action.
     */
    constructor(fn, validateProps, validateResult) {
        this.fn = fn;
        this.validatePropsFn = validateProps;
        this.validateResultFn = validateResult;
    }
    /**
     * Run this action's prop validation function against an unknown value.
     * Resolves the value casted to the actions prop type if successful.
     * Throws otherwise.
     *
     * @param props - The props value to validate.
     * @returns The passed props value wrapped in a promise. Throws if validation fails.
     */
    async runPropValidation(props) {
        const { validatePropsFn } = this;
        return validatePropsFn(props);
    }
    /**
     * Run this action's result validation function against an unknown value.
     * Resolves the value casted to the actions result type if successful.
     * Throws otherwise.
     *
     * @param result - The result value to validate.
     * @returns The passed result value wrapped in a promise. Throws if validation fails.
     */
    async runResultValidation(result) {
        const { validateResultFn } = this;
        if (validateActionResults && typeof validateResultFn === 'function') {
            return validateResultFn(result);
        }
        else {
            return result;
        }
    }
    /**
     * Validate the props, runs the action, and validates and returns the result as a promise.
     *
     * @param db - The db instance to run the action against.
     * @param props - The unvalidated input to the action.
     * @returns A promise that resolves to the result of the action.
     */
    async run(db, props) {
        return this.runResultValidation(await this.fn(db, await this.runPropValidation(props)));
    }
}

/**
 * Create a user
 */
const createUser = new Action(async (db, props) => {
    const { User } = db.models;
    const { email, password, firstName, lastName } = props;
    const user = await User.query().insertAndFetch({
        email,
        password,
        firstName,
        lastName,
    });
    return user;
}, object => { var path = ["$"]; function _string(object) { if (typeof object !== "string")
    return "validation failed at " + path.join(".") + ": expected a string";
else
    return null; } function _77(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
    return "validation failed at " + path.join(".") + ": expected an object"; {
    if ("email" in object) {
        path.push("email");
        var error = _string(object["email"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'email' in object";
} {
    if ("password" in object) {
        path.push("password");
        var error = _string(object["password"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'password' in object";
} {
    if ("firstName" in object) {
        path.push("firstName");
        var error = _string(object["firstName"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'firstName' in object";
} {
    if ("lastName" in object) {
        path.push("lastName");
        var error = _string(object["lastName"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'lastName' in object";
} return null; } var error = _77(object); if (error)
    throw new Error(error);
else
    return object; }, object => { var path = ["$"]; function _number(object) { if (typeof object !== "number")
    return "validation failed at " + path.join(".") + ": expected a number";
else
    return null; } function _string(object) { if (typeof object !== "string")
    return "validation failed at " + path.join(".") + ": expected a string";
else
    return null; } function _78(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
    return "validation failed at " + path.join(".") + ": expected an object"; {
    if ("id" in object) {
        path.push("id");
        var error = _number(object["id"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'id' in object";
} {
    if ("email" in object) {
        path.push("email");
        var error = _string(object["email"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'email' in object";
} {
    if ("password" in object) {
        path.push("password");
        var error = _string(object["password"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'password' in object";
} {
    if ("firstName" in object) {
        path.push("firstName");
        var error = _string(object["firstName"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'firstName' in object";
} {
    if ("lastName" in object) {
        path.push("lastName");
        var error = _string(object["lastName"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'lastName' in object";
} return null; } var error = _78(object); if (error)
    throw new Error(error);
else
    return object; });

const foo = new Action(async (db, props) => {
    return {
        dsajdsa: 'foo',
        aksdkao: false,
        dshuai: 10,
    };
}, object => { var path = ["$"]; function _string(object) { if (typeof object !== "string")
    return "validation failed at " + path.join(".") + ": expected a string";
else
    return null; } function _number(object) { if (typeof object !== "number")
    return "validation failed at " + path.join(".") + ": expected a number";
else
    return null; } function _74(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
    return "validation failed at " + path.join(".") + ": expected an object"; {
    if ("blarb" in object) {
        path.push("blarb");
        var error = _string(object["blarb"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'blarb' in object";
} {
    if ("dsadsa" in object) {
        path.push("dsadsa");
        var error = _number(object["dsadsa"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'dsadsa' in object";
} return null; } var error = _74(object); if (error)
    throw new Error(error);
else
    return object; }, object => { var path = ["$"]; function _string(object) { if (typeof object !== "string")
    return "validation failed at " + path.join(".") + ": expected a string";
else
    return null; } function _boolean(object) { if (typeof object !== "boolean")
    return "validation failed at " + path.join(".") + ": expected a boolean";
else
    return null; } function _number(object) { if (typeof object !== "number")
    return "validation failed at " + path.join(".") + ": expected a number";
else
    return null; } function _75(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
    return "validation failed at " + path.join(".") + ": expected an object"; {
    if ("dsajdsa" in object) {
        path.push("dsajdsa");
        var error = _string(object["dsajdsa"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'dsajdsa' in object";
} {
    if ("aksdkao" in object) {
        path.push("aksdkao");
        var error = _boolean(object["aksdkao"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'aksdkao' in object";
} {
    if ("dshuai" in object) {
        path.push("dshuai");
        var error = _number(object["dshuai"]);
        path.pop();
        if (error)
            return error;
    }
    else
        return "validation failed at " + path.join(".") + ": expected 'dshuai' in object";
} return null; } var error = _75(object); if (error)
    throw new Error(error);
else
    return object; });

// export * from './login.action';
// export * from './logout.action';
// export * from './register.action';

var actionIndex = /*#__PURE__*/Object.freeze({
  createUser: createUser,
  foo: foo
});

/**
 * Takes a db object and binds it to each action in the actions index.
 * Returns an action index where the keys match the action names and the
 * values are action run functions with the db prebound.
 */
function bindDbToActions(db) {
    const actionRunIndex = {};
    for (const [key, action] of Object.entries(actionIndex)) {
        actionRunIndex[key] = action.run.bind(action, db);
    }
    return actionRunIndex;
}

/**
 * Attaches database to context under the key `db`.
 *
 * @param knex - The knex instance to use.
 */
function dbMiddleware(db) {
    const actions = bindDbToActions(db);
    return function dbMiddlewareHandler(context, next) {
        context.db = db;
        context.actions = actions;
        return next();
    };
}

var userRouter = new Router().post('/user', async (context) => {
    const result = await context.actions.createUser(context.request.body);
    context.response.status = 200;
    context.response.body = {
        result,
    };
});

var routers = [userRouter];

/**
 * Creates the koa webserver and attaches middleware and routers.
 *
 * @param port - The port for the server to listen on.
 * @param db - The Db instance to run the server against.
 * @returns Promise<void>
 */
async function startServer(port, db) {
    const secret = process.env.API_SECRET;
    if (!secret) {
        throw new Error(`You must define the API_SECRET environmental variable.`);
    }
    const apiRouter = new Router().prefix('/api');
    const koa = new Koa()
        .use(koaHelmet()) // Add security headers
        .use(createErrorMiddleware()) // Log requests and handle errors
        .use(KoaBodyparser()) // Parse request body
        .use(dbMiddleware(db)) // Attach knex to context
        .use(
    // Parse auth token from requests
    jwtMiddleware({
        secret,
        passthrough: true,
        getToken: getAuthTokenFromContext,
    }));
    // Attach routers to root API router
    for (const router of routers) {
        apiRouter.use(router.routes()).use(router.allowedMethods());
    }
    // Attach root API router to Koa app
    koa.use(apiRouter.routes()).use(apiRouter.allowedMethods());
    return new Promise((resolve, reject) => {
        koa.listen(port, (error) => {
            if (error) {
                logError('Failed to start koa server', error);
                reject(error);
            }
            else {
                log(`Listening on port ${port}`);
                resolve();
            }
        });
    });
}
/**
 * Retrieves the auth token from either an `authToken` cookie or `Authorization` header.
 *
 * @param context - Koa app context
 * @returns Auth token string. Returns a blank string if no token is found.
 */
function getAuthTokenFromContext(context) {
    const cookie = context.cookies.get('authToken');
    if (cookie) {
        return cookie;
    }
    const header = context.request.headers.Authorization;
    if (header) {
        return header;
    }
    return '';
}

/**
 * Entry point for running the API server.
 */
dotenv.config({
    path: path.resolve(__dirname, '..', '.env'),
});
const port$1 = parseInt(process.env.PORT || '8080', 10);
startServer(port$1, Db.getDefault());
