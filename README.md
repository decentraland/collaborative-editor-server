# Collaborative Editor Server 

[![Coverage Status](https://coveralls.io/repos/github/decentraland/collaborative-editor-server/badge.svg?branch=coverage)](https://coveralls.io/github/decentraland/collaborative-editor-server?branch=coverage)

A server designed to enable collaborative scene editing.

# Running locally

Copy file `.env.default` to `.env` and modify any relevant setting as needed. For example:

```bash
cp .env.default .env
```

Run `yarn` to install dependencies, `yarn build` to build the server. You can also run `yarn build:watch` to keep monitoring for changes and recompiling to pick
up those changes.

```bash
yarn
yarn build
```

Finally, run `yarn start` to start the server.

```bash
yarn start
```

# Deploying the server to prod

You can find a public docker image in `quay.io/decentraland/collaborative-editor-server`.

```bash
docker pull quay.io/decentraland/collaborative-editor-server:latest
docker run -p 8080:3000 --name collab-editor quay.io/decentraland/collaborative-editor-server:latest
```

Please remember this API is in alpha state; it can change without any heads up.
