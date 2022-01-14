import express from 'express';
const { bglist } = require("../../api/data/backgrounds.json")
const router = express.Router();

router.get("/api/backgrounds/:id", (req, res): void => {
    const id = req.params.id;
    const background = bglist.find(bg => bg.id === id);
    if (background) {
        res.sendFile(background.filename, { root: "./api/content/backgrounds" });
    } else {
        res.sendFile("404.png", { root: "./api/content" });
    }
});

router.get("/api/memes/laranjo.png", (req, res) => {
    res.sendFile("laranjo.jpeg", { root: "./api/content" });
});

router.get("/api/memes/fodase.png", (req, res) => {
    res.sendFile("fodase.jpeg", { root: "./api/content" });
});

router.get("/api/memes/notstonks.png", (req, res) => {
    res.sendFile("notstonks.png", { root: "./api/content" });
});

router.get("/api/memes/stonks.png", (req, res) => {
    res.sendFile("stonks.png", { root: "./api/content" });
});

router.get("/api/memes/windows.png", (req, res) => {
    res.sendFile("windows.png", { root: "./api/content" });
});

router.get("/api/memes/comunismo.png", (req, res) => {
    res.sendFile("comunismo.png", { root: "./api/content" });
});

router.get("/api/memes/windows.png", (req, res) => {
    res.sendFile("windows.png", { root: "./api/content" })
});

router.get("/api/memes/namorada.png", (req, res) => {
    res.sendFile("namorada.png", { root: "./api/content" })
});

router.get("/api/memes/perfeito.png", (req, res) => {
    res.sendFile("perfeito.png", { root: "./api/content" })
})

export = router;