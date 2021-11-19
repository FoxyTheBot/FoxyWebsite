# Foxy Website

## Clonando o repositório do Website
<p>Para isso você irá precisar do <a href="https://git-scm.com/">git</a></p>

```bash
git clone https://github.com/FoxyTheBot/FoxyWebsite
```

## Configurando o ambiente de desenvolvimento

<p> Para isso você irá precisar do <a href="https://code.visualstudio.com">Visual Studio Code</a>

> Configurando .env

<p> Crie um arquivo chamado .env com as seguintes informações:</p>

```
CLIENT_SECRET=<seu-client-secret-do-discord>
MONGO_URI=<seu-uri-do-mongodb>
```

## Executando o servidor

<p>Para executar você irá precisar do Node.js</p>

<p>Instale as dependências:</p>

```bash
npm install
```
<p>No arquivo start.js insira uma porta de preferência por padrão usamos a porta 8081:</p>

```js
const App = require('./App');
const client = new App(8081);
client.start();
```

<p> Execute o servidor:</p>

```bash
 node start.js
```


<p>Você não pode usar o nome do bot <a href="https://github.com/FoxyTheBot/Foxy">Foxy</a> no website como se fosse seu bot.