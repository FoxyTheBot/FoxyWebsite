import express from 'express';
require('dotenv').config();
const app = express();

app.use(express.static('./build/public/pages'));
app.set('view engine', 'ejs');

app.use('/', require("../routes/controller/updatePage"));
app.use('/', require("../routes/controller/redirectPage"));
app.use('/', require("../routes/auth/oauthDiscord"));

export { app };