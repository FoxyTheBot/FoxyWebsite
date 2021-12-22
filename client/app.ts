import * as express from 'express';
require('dotenv').config();

export class App {
    port: number;
    constructor(port) {
        this.port = port;
    }

    startServer(): void {
        const app = express();

        app.use(express.static('./build/public/pages'));
        app.set('view engine', 'ejs');

        app.use('/', require("../routes/controller/updatePage"));
        app.use('/', require("../routes/controller/redirectPage"));
        app.use('/', require("../routes/auth/oauthDiscord"));


        app.listen(this.port, () => {
            console.log(`[APP] Servidor iniciado na porta ${this.port}`);
        });

    }
}
