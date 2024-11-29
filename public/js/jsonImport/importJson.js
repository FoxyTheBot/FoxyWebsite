import { showNotification } from '/js/notification.js';

function importJsonFromForm() {
    const bot = document.getElementById("botSelect").value;
    const jsonInput = document.getElementById("jsonInput").value;

    if (!bot || !jsonInput) {
        alert("Por favor, selecione um bot e cole o JSON.");
        return;
    }

    try {
        const json = JSON.parse(jsonInput);
        const convertedJson = importJson(bot, json);

        if (convertedJson.embeds) {
            document.getElementById("embedTitle").value = convertedJson.embeds[0]?.title || '';
            document.getElementById("embedDescription").value = convertedJson.embeds[0]?.description || '';
            document.getElementById("embedFooter").value = convertedJson.embeds[0].footer?.text || '';
            document.getElementById("imageLink").value = convertedJson.embeds[0]?.image?.url || '';
            document.getElementById("embedColor").value = convertedJson.embeds[0]?.color || '#ffffff';
            document.getElementById("showAvatar").checked = convertedJson.embeds[0]?.thumbnail?.url ? true : false;

            if (convertedJson.embeds[0]?.color) {
                document.getElementById("embedColor").value = `#${convertedJson.embeds[0].color.toString(16).padStart(6, '0')}`;
            }
        } else {
            document.getElementById("embedTitle").value = '';
            document.getElementById("embedDescription").value = '';
            document.getElementById("embedFooter").value = '';
            document.getElementById("imageLink").value = '';
            document.getElementById("embedColor").value = '#ffffff';
            document.getElementById("showAvatar").checked = false;
        }
        document.getElementById("messageContent").value = convertedJson.content || '';


        showNotification("success", "JSON importado com sucesso!");
        window.showActionsWrapper();
        hide();
    } catch (error) {
        showNotification("error", "Erro ao importar JSON.");
        hide();
        console.log(error);
    }
}

function hide() {
    const popup = document.getElementById('popup');
    popup.classList.remove('visible');
    document.getElementById("jsonInput").value = "";
    document.getElementById("botSelect").value = "";
    document.getElementById("botImage").src = "https://cdn.discordapp.com/embed/avatars/0.png";

    setTimeout(() => {
        popup.classList.add('hidden');
    }, 300);
}
function importJson(bot, json) {
    switch (bot) {
        case 'loritta':
            const convertedJson = importFromLoritta(json);
            return convertedJson;

        case 'carl-bot':
            const convertedJsonCarl = importFromCarl(json);
            return convertedJsonCarl;
        default:
            showNotification("error", "Bot não suportado.");
            break;
    }
}

const placeholderMap = {
    /* Loritta placeholders */

    "{@user}": "{@user}",
    "{user}": "{user}",
    "{user.name}": "{user}",
    "{user.id}": "{user.id}",
    "{guild}": "{guild.name}",
    "{guild.name}": "{guild.name}",
    "{guild.id}": "{guild.id}",
    "{user.avatar}": "{user.avatar}",
    "{guild.icon}": "{guild.icon}",

    /* Carlbot placeholders */

    "{mention}": "{@user}",
    "{user}": "{user}",
    "{server}": "{guild.name}",
    "{user(id)}": "{user.id}",
};

const incompatiblePlaceholder = "placeholder incompatível";

function replacePlaceholders(obj) {
    if (typeof obj === "string") {
        return obj.replace(/{[^}]+}/g, (match) =>
            placeholderMap[match] || incompatiblePlaceholder
        );
    } else if (Array.isArray(obj)) {
        return obj.map(replacePlaceholders);
    } else if (typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, replacePlaceholders(value)])
        );
    }
    return obj;
}

function importFromLoritta(json) {
    const convertedJson = replacePlaceholders(json);

    if (convertedJson.embed) {
        convertedJson.embeds = [convertedJson.embed];
        delete convertedJson.embed;
    }

    if (convertedJson.content) {
        convertedJson.content = replacePlaceholders(convertedJson.content);
    }

    return convertedJson;
}

function importFromCarl(json) {
    const convertedJson = {
        embeds: [{
            title: null,
            description: null,
            color: null,
            image: {
                url: null
            },
            thumbnail: {
                url: null
            },
            footer: {
                text: null
            }
        }]
    };
    console.log(json)
    if (json.title) {
        convertedJson.embeds[0].title = replacePlaceholders(json.title);
    }
    if (json.description) {
        convertedJson.embeds[0].description = replacePlaceholders(json.description);
    }
    if (json.color) {
        convertedJson.embeds[0].color = json.color;
    }


    if (json.image) {
        convertedJson.embeds[0].image = {
            url: json.image.url || null
        }
    }
    if (json.thumbnail) {
        convertedJson.embeds[0].thumbnail = {
            url: json.thumbnail.url || null
        }
    }

    if (json.footer) {
        convertedJson.embeds[0].footer = {
            text: replacePlaceholders(json.footer.text)
        }
    }

    return convertedJson;
}

window.importJsonFromForm = importJsonFromForm;
window.importJson = importJson;