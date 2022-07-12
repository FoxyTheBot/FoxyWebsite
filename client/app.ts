import express, { Application } from 'express';
import useragent from 'express-useragent';
require('dotenv').config();

export class App {
    port: number;
    constructor(port) {
        this.port = port;
    }

    startServer(): void {
        const app: Application = express();

        app.use(express.json());
        app.use(useragent.express());
        app.use(express.urlencoded());
        app.use(express.static('./public/pages'));
        app.set('view engine', 'ejs');

        app.use('/', require("../routes/controller/updatePage"));
        app.use('/', require("../routes/controller/redirectPage"));
        app.use('/', require("../routes/auth/oauthDiscord"));


        app.listen(this.port, () => {
            console.log(`[APP] Servidor iniciado na porta ${this.port}`);
        });

    }
}