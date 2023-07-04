import express, { Application } from 'express';
require('dotenv').config();

export class App {
    port: number;
    constructor(port) {
        this.port = port;
    }

    startServer(): void {
        const app: Application = express();

        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.static('./public/pages'));
        app.set('view engine', 'ejs');

        app.use('/', require("../routes/controller/updatePage"));
        app.use('/', require("../routes/controller/redirectPage"));
        app.use('/', require("../routes/auth/oauthDiscord"));
        
        app.get('*', (req, res) => {
            if (!req.session.bearer_token) {
                res.status(200).render("../public/pages/logged-off/404.ejs");
            } else {
                res.status(200).render("../public/pages/logged/404.ejs", {
                    user: req.session.user_info,
                });
            }
        });

        app.listen(this.port, () => {
            console.log(`[APP] Server started at port: ${this.port}`);
        });

    }
}