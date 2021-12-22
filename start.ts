import { app } from './client/app';
const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`[APP] Servidor iniciado na porta ${port}`);
});