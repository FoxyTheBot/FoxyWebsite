<h1>💻 Foxy Website</h1>

<br>

### ✨ | Requirements
- NodeJS v18.x or higher
- Git
- yarn or npm

### Configuring the environment

<p> You need to install <a href="https://code.visualstudio.com">Visual Studio Code</a> or another IDE

<p>Create a `config.json` file with these values:</p>

```json
{
    "url": "website url (must contains http or https)",
    "oauth": {
        "clientId": "bot id",
        "ownerId": "your discord id",
        "callbackURL": "http://url/login/callback",
        "scopes": [
            "identify",
            "guilds",
            "email"
        ]
    },
    "session": {
        "cookie": {
            "maxAge": 604800000
        }
    }
}
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

<p>In start.ts you can change the HTTP port.</p>

```ts
import { App } from './client/app';
const client = new App(3000);
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
