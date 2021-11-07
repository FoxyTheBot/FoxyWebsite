const express = require ('express');
const app = express();
const config = require('./config.json');

require('dotenv').config();

app.use(express.static('./pages'));
app.set('view engine', 'ejs');

app.use('/', require("./routes/controller/updatePage"));
app.use('/', require("./routes/controller/redirectPage"));
app.use('/', require("./routes/auth/oauthDiscord.js"));

app.listen(config.port, () => {
    console.clear();
    console.log(`[APP] Servidor iniciado na porta ${config.port}`);
});