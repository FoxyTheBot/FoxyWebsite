import * as express from 'express';
const router = express.Router();
const config = require('../../config.json');
import { bot, database } from '../../client/app';
import session from 'express-session';

router.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_TOKEN,
    cookie: {
        maxAge: config.session.cookie.maxAge
    }
}));

router.get("/", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/index.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/index.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get("/:lang/rso/login", (req, res) => {
    const data = {
        puuid: req.query.puuid,
        gameName: req.query.gameName,
        tagLine: req.query.tagLine,
        authCode: req.query.key
    };

    res.status(200).render("../public/pages/utils/rso.ejs", {
        user: null,
        body: data
    });
});


router.get("/:lang/support/guidelines", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/guidelines.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/info/guidelines.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get('/:lang/premium', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/premium.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/info/premium.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get("/:lang/support/terms", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/privacy.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/info/privacy.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get('/:lang/dashboard', (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login')
    } else {
        res.status(200).render("../public/pages/utils/rso.ejs", {
            user: req.session.user_info,
        });
    }
});
// router.get('/:lang/dashboard', async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login')
//     } else {
//         const user = await req.session.user_info;
//         const guildsResult = await fetch('https://discord.com/api/users/@me/guilds', {
//             headers: {
//                 authorization: `${req.session.oauth_type} ${req.session.bearer_token}`,
//             }
//         });
//         const guilds: any = await guildsResult.json();
//         const guildsArray: any = [];
//         function hasRequiredPermissions(permissions: number): boolean {
//             return (permissions & (8 | 32)) !== 0;
//         }

//         for (let i = 0; i < guilds.length; i++) {
//             const guild = guilds[i];

//             if (hasRequiredPermissions(Number(guild.permissions))) {
//                 guildsArray.push({
//                     id: guild.id,
//                     name: guild.name,
//                     icon: guild.icon,
//                     permissions: guild.permissions,
//                 })
//             }
//         }

//         res.status(200).render("../public/pages/dashboard/guild/servers.ejs", {
//             user: user,
//             guilds: guildsArray
//         });
//     }
// });

router.get("/riot/connection/status=:status", (req, res) => {
    const status = req.params.status;
    let message, description;
    if (status === "200") {
        message = "Sua conta da Riot Games foi conectada a Foxy",
            description = "Pode fechar esta página e voltar para o Discord"
    } else {
        message = "Sua conta da Riot Games não foi conectada a Foxy",
            description = "Desculpe, mas ocorreu um problema estranho ao conectar sua conta da Riot Games a Foxy. Tente novamente mais tarde."
    }

    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/riotAccountConnected.ejs", {
            user: null,
            message,
            description
        });
    } else {
        res.status(200).render("../public/pages/info/riotAccountConnected.ejs", {
            user: req.session.user_info,
            message,
            description
        });
    }
});

// router.get("/:lang/servers/:id", async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login');
//     } else {
//         const id = req.params.id;
//         try {
//             await bot.helpers.getGuild(id);
//         } catch (err) {
//             return res.redirect(`https://discord.com/oauth2/authorize?client_id=1006520438865801296&scope=bot+applications.commands&permissions=269872255&guild_id=${id}&redirect_uri=https://foxybot.win/dashboard`)
//         }

//         const user = await req.session.user_info;
//         const guildsResult = await fetch(`https://discord.com/api/users/@me/guilds`, {
//             headers: {
//                 authorization: `${req.session.oauth_type} ${req.session.bearer_token}`,
//             }
//         });
//         const guilds: any = await guildsResult.json();
//         const guildsArray: any = [];

//         function hasRequiredPermissions(permissions: number): boolean {
//             return (permissions & (8 | 32)) !== 0;
//         }

//         for (let i = 0; i < guilds.length; i++) {
//             const guild = guilds[i];

//             if (hasRequiredPermissions(Number(guild.permissions))) {
//                 guildsArray.push({
//                     id: guild.id,
//                     name: guild.name,
//                     icon: guild.icon,
//                     permissions: guild.permissions,
//                 })
//             }
//         }

//         const guild = await guildsArray.find((x: any) => x.id === req.params.id);
//         const guildIcon = await guild.icon;
//         const guildInfo = await database.getGuild(req.params.id);
//         if (!guildInfo) {
//             return res.redirect("/add");
//         }

//         const guildChannels = await fetch(`https://discord.com/api/guilds/${guild.id}/channels`, {
//             headers: {
//                 authorization: `Bot ${process.env.BOT_TOKEN}`,
//             }
//         });

//         const guildChannelsJson = await guildChannels.json();
//         const guildRoles = await fetch(`https://discord.com/api/guilds/${guild.id}/roles`, {
//             headers: {
//                 authorization: `Bot ${process.env.BOT_TOKEN}`,
//             }
//         });

//         const guildRolesJson = await guildRoles.json();
//         let icon;

//         if (guildIcon) {
//             icon = `https://cdn.discordapp.com/icons/${guild.id}/${guildIcon}.png`;
//         } else {
//             icon = `https://cdn.discordapp.com/attachments/1068525425963302936/1132369142780014652/top-10-cutest-cat-photos-of-all-time.jpg`
//         }
//         if (!guild) return res.redirect("/servers");

//         res.status(200).render("../public/pages/dashboard/guild/inviteBlockerModule.ejs", {
//             user: user,
//             guilds: guildsArray,
//             guild: guild,
//             icon: icon,
//             channels: guildChannelsJson,
//             roles: guildRolesJson,
//             guildInfoFromDB: guildInfo,
//             blockMessage: guildInfo.InviteBlockerModule.blockMessage ?? "Você não pode enviar convites aqui!",
//         });
//     }
// });

// router.post("/inviteblocker/save/:id", async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login');
//     } else {
//         const body = req.body;

//         const guildInfo = await database.getGuild(req.params.id);
//         let selectedChannels = body.selectedChannels.split(",");
//         let selectedRoles = body.selectedRoles.split(",");
//         if (selectedChannels[0] === "") selectedChannels = [];
//         if (selectedRoles[0] === "") selectedRoles = [];
//         guildInfo.InviteBlockerModule.whitelistedChannels = selectedChannels;
//         guildInfo.InviteBlockerModule.whitelistedRoles = selectedRoles;


//         guildInfo.InviteBlockerModule.isEnabled = body.inviteblocker ? true : false;
//         guildInfo.InviteBlockerModule.blockMessage = body.blockmessage.trim();
//         await guildInfo.save();

//         res.redirect(`/br/servers/${req.params.id}`);
//     }
// });

// router.get('/:lang/servers/:id/keys', async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login');
//     } else {
//         const userData: any = await database.getUser(req.session.user_info.id);
//         const guildInfo = await database.getGuild(req.params.id);

//         res.status(200).render('../public/pages/dashboard/guild/keyManager.ejs', {
//             guild: guildInfo,
//             userInfo: userData,
//             user: req.session.user_info
//         });
//     }
// });

// router.get('/:lang/daily', async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login');
//     } else {
//         const userId = req.session.user_info.id;
//         const userData: any = await database.getUser(userId);
//         const timeout = 43200000;
//         const daily = await userData.lastDaily;

//         var allowed = true;
//         if (daily !== null && timeout - (Date.now() - daily) > 0) {
//             allowed = false;
//         }
//         var img = "../assets/images/foxyoculos.png";

//         if (allowed) {

//             let amount = Math.floor(Math.random() * 8000);
//             amount = Math.round(amount / 10) * 10;
//             switch (userData.premiumType) {
//                 case "1": {
//                     amount = amount * 1.25;
//                     break;
//                 }

//                 case "2": {
//                     amount = amount * 1.5;
//                     break;
//                 }

//                 case "3": {
//                     amount = amount * 2;
//                     break;
//                 }
//             }
//             if (amount < 1000) amount = 1000;

//             userData.balance += amount;
//             userData.lastDaily = Date.now();
//             userData.save().catch(err => console.log(err));

//             req.session.coins = amount;
//             req.session.dbCoins = userData.balance;
//         } else {
//             req.session.coins = 0;
//             req.session.dbCoins = userData.balance;
//         }

//         res.status(200).render("../public/pages/dashboard/user/daily.ejs", {
//             user: req.session.user_info,
//             coins: req.session.coins.toLocaleString('pt-BR'),
//             img: img,
//             dbCoins: req.session.dbCoins.toLocaleString('pt-BR'),
//             allowed
//         });
//     }
// });

// router.get('/:lang/delete', async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login');
//     } else {
//         const userId = req.session.user_info.id;
//         const userData: any = await database.getUser(userId);
//         const marriedData: any = await database.getUser(userId);

//         marriedData.marriedWith = null;
//         marriedData.save()
//         userData.remove().catch(err => console.log(err));
//         req.session.destroy();
//         return res.status(200).render("../public/pages/utils/deletedUser.ejs");
//     }
// });

router.get("/:lang/commands", async (req, res) => {
    const commandsList = await database.getAllCommands();
    // @ts-ignore Property filter doesn't exist on type void
    const commands = commandsList.filter(command => command.description && command.commandName !== "foxytools");
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/commands.ejs", {
            user: null,
            commands
        });
    } else {
        res.status(200).render("../public/pages/info/commands.ejs", {
            user: req.session.user_info,
            commands
        });
    }
});

// router.get('/:lang/confirm', async (req, res) => {
//     if (!req.session.bearer_token) {
//         res.redirect('/login');
//     } else {
//         const userId = req.session.user_info.id;
//         const userData = await database.getUser(userId);
//         res.status(200).render("../public/pages/utils/confirm.ejs", {
//             user: req.session.user_info,
//             db: userData
//         });
//     }
// });


router.get('/:lang/support', async (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/support.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/info/support.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get('/:lang/support/ban-appeal', async (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/banAppeal.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/info/banAppeal.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get("/:lang/aboutme", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;
        const userData: any = await database.getUser(userId);

        res.status(200).render("../public/pages/dashboard/user/aboutMe.ejs", {
            user: req.session.user_info,
            db: userData
        })
    }
});

router.post("/:lang/submit", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userData: any = await database.getUser(req.session.user_info.id);
        userData.aboutme = req.body.aboutme;
        userData.save().catch(err => console.log(err));
        return res.redirect('/dashboard');
    }
});

router.get('/:lang/error', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/errors/error.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/errors/error.ejs", {
            user: req.session.user_info
        });
    }
});

router.get('/:lang/404', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/errors/404.ejs", {
            user: null,
        });
    } else {
        res.status(200).render("../public/pages/errors/404.ejs", {
            user: req.session.user_info
        });
    }
});

module.exports = router;