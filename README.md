# next-ts-boilerplate

A batteries included NextJS boilerplate.

## Features

- Custom webserver with API proxying.
- CSS-in-JS with Styled components
- Formatting with Prettier
- Linting with TSLint
- Git hooks with Husky and Lint-Staged
- Tests with Jest and Enzyme

## Setup

Clone

```
git clone https://github.com/jmeyers91/next-ts-boilerplate.git
```

Install dependencies

```
cd next-ts-boilerplate
npm install
cd client
npm install
```

Build

```
cd client
npm run build
```

Start (after building)

```
cd client
npm run start
```

Develop

```
cd client
npm run watch
```

Test

```
cd client
npm run test
```

Lint code

```
npm run lint
```

Format code

```
npm run format
```

## Deploy

To deploy the API server, you must set these environmental variables:

- `RUN_MODE=API` - Tells the top-level post-install and start scripts to target the API server.
- `API_SECRET` - The secret used to sign JSON web tokens for authentication. Keep it safe.

To deploy the client server, you must set these environmental variables:

- `RUN_MODE=CLIENT` - Tells the top-level post-install and start scripts to target the client server.
- `API_URL` - The URL of the deployed API server to proxy requests to.
