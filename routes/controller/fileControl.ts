import express from 'express';
const { bglist } = require("../../bot-assets/data/backgrounds.json")
const router = express.Router();

router.get("/api/backgrounds/:id", (req, res): void => {
    const id = req.params.id;
    const background = bglist.find(bg => bg.id === id);
    if (background) {
        res.sendFile(background.filename, { root: "./bot-assets/content/backgrounds" });
    } else {
        res.sendFile("404.png", { root: "./bot-assets/content" });
    }
});

router.get("/api/memes/laranjo.png", (req, res) => {
    res.sendFile("laranjo.jpeg", { root: "./bot-assets/content" });
});

router.get("/api/memes/fodase.png", (req, res) => {
    res.sendFile("fodase.jpeg", { root: "./bot-assets/content" });
});

router.get("/api/memes/notstonks.png", (req, res) => {
    res.sendFile("notstonks.png", { root: "./bot-assets/content" });
});

router.get("/api/memes/stonks.png", (req, res) => {
    res.sendFile("stonks.png", { root: "./bot-assets/content" });
});

router.get("/api/memes/windows.png", (req, res) => {
    res.sendFile("windows.png", { root: "./bot-assets/content" });
});

router.get("/api/memes/comunismo.png", (req, res) => {
    res.sendFile("comunismo.png", { root: "./bot-assets/content" });
});

router.get("/api/memes/windows.png", (req, res) => {
    res.sendFile("windows.png", { root: "./bot-assets/content" })
});

router.get("/api/memes/namorada.png", (req, res) => {
    res.sendFile("namorada.png", { root: "./bot-assets/content" })
});

router.get("/api/memes/perfeito.png", (req, res) => {
    res.sendFile("perfeito.png", { root: "./bot-assets/content" })
})

export = router;