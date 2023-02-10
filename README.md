# Foxy Website

### ✨ | Requirements
- NodeJS v16.x or higher
- Git
- npm

### Configuring the environment

<p> You need to install <a href="https://code.visualstudio.com">Visual Studio Code</a> or another IDE

> Configuring .env

<p>Create a .env file with these values:</p>

```
CLIENT_SECRET=<your-bot-secret>
MONGO_URI=<your-mongodb-uri>
BOT_TOKEN=<your-bot-token>
REPORT=<your-report-webhook>
SUGGESTION=<your-suggestion-webhook>
```

## Running the server

<p>Install TSC in your computer</p>

```bash
$ npm install -g typescript
```
<p>Install all website dependencies</p>

```bash
$ npm install
```

<p>In start.ts you can change the HTTP port, but I prefer 8081</p>

```ts
import { App } from './client/app';
const client = new App(8081);
client.start();
```
<p>Compile the server</p>

```bash
$ npm run build
```

<p>Run the server</p>

```bash
$ npm run start
```
