const express = require('express');
require('dotenv').config();

module.exports = class App {
    constructor(port) {
        this.app = express();
        this.port = port;
    }

    start() {
        this.app.use(express.static('./public/pages'));
        this.app.set('view engine', 'ejs');

        this.app.use('/', require("./routes/controller/updatePage"));
        this.app.use('/', require("./routes/controller/redirectPage"));
        this.app.use('/', require("./routes/auth/oauthDiscord"));


        this.app.listen(this.port, () => {
            console.log(`[APP] Servidor iniciado na porta ${this.port}`);
        });

    }
}
