import express, { Application } from 'express';
require('dotenv').config();
import DatabaseConnection from '../database/DatabaseConnection';
import session from 'express-session';
import bodyParser from 'body-parser';
import { bot } from '../structures/discord/FoxyClient';
export class App {
    port: number;
    constructor(port) {
        this.port = port;
    }

    startServer(): void {
        const app: Application = express();
        app.use(express.json());
        app.use(express.static('./public'));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: process.env.SESSION_TOKEN,
        }));

        app.set('view engine', 'ejs');

        app.use('/', require("../routes/controller/updatePage"));
        app.use('/', require("../routes/controller/redirectPage"));
        app.use('/', require("../routes/auth/oauthDiscord"));

        app.get('*', (req, res) => {
            if (!req.session.bearer_token) {
                res.status(200).render("../public/pages/errors/404.ejs", {
                    user: null,
                });
            } else {
                res.status(200).render("../public/pages/errors/404.ejs", {
                    user: req.session.user_info,
                });
            }
        });

        app.listen(this.port, () => {
            console.log(`[APP] Server started at port: ${this.port}`);
        });

    }
}

const database = new DatabaseConnection(bot);
export { database, bot };