import express, { Application } from 'express';
require('dotenv').config();
import DatabaseConnection from '../database/DatabaseConnection';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../config.json';
import RestManager from '../structures/RestManager';
import { logger } from '../structures/logger';
import UpdatePages from '../routes/controller/UpdatePages';
import DashboardRoutes from '../routes/controller/DashboardRoutes';

export class App {
    port: number;
    constructor(port) {
        this.port = port;
    }

    startServer(): void {
        const app: Application = express();
        app.use(express.json({ limit: '10kb' }));
        app.use(express.static('./public'));
        
        app.use(bodyParser.urlencoded({ limit: '10kb', extended: true }));
        app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: process.env.SESSION_TOKEN,
            cookie: {
                maxAge: config.session.cookie.maxAge,
                httpOnly: true,
            }
        }));

        app.set('view engine', 'ejs');

        app.use('/', new UpdatePages().getRouter());
        app.use('/', new DashboardRoutes().getRouter());
        app.use('/', require("../routes/auth/oauthDiscord"));
        app.use('/', require("../routes/controller/RedirectPages"));

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
            logger.info(`[SERVER] Server started at port: ${this.port}`);
        });

    }
}

const database = new DatabaseConnection();
const rest = new RestManager();
export { database, rest };