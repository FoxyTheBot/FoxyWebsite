const express = require('express');
require('dotenv').config();

module.exports = class App {
    constructor(port) {
        this.port = port;
    }

    startServer() {
        const app = express();

        app.use(express.static('./public/pages'));
        app.set('view engine', 'ejs');

        app.use('/', require("./routes/controller/updatePage"));
        app.use('/', require("./routes/controller/redirectPage"));
        app.use('/', require("./routes/auth/oauthDiscord"));


        app.listen(this.port, () => {
            console.log(`[APP] Servidor iniciado na porta ${this.port}`);
        });

    }
}
