import { createCommand, createEvent } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, GuildMember } from "discord.js";

const CHANNEL_ID = "1272622205204959245";

const messages = {
    morning: [
        "Ohayou~ {user}! Já posso anotar seu pedido? 😊",
        "Ohayou~ {user}! Posso montar um combo simples pra você começar bem o dia ? 😉📋",
        "Ah~ {user}, essa manhã tranquila tá com cara de Double Crunch… quer experimentar? 😌🍔",
        "Bom dia~ {user}! Posso já deixar um milkshake separado pra depois? 🤭🥤",
        "Ohayou~ {user}! Ótimo horário pra escolher algo com calma 😉📋",

        // ⭐ 
        "Ohayou~ {user}... Hinori ainda tá acordando 😳☀️ mas já posso anotar seu pedido..."
    ],

    afternoon: [
        "Chegou em boa hora, {user}! Posso montar um combo de tirinhas + batata frita? 😊🍟",
        "Boa tarde~ {user}! Posso te sugerir um Double Crunch BBQ com tiras de frango? 😋",
        "Konnichiwa~ {user}! Já escolheu entre um sanduíche ou tiras com molho picante? 🔥😏",
        "Boa tarde~ {user}! A fome da tarde bate diferente… vai de balde ou combo? 😏🍗",
        "Oi oi~ {user}! Hmm~ que tal um balde de frango crocante pra matar a fome? 🤭",

        // ⭐ 
        "Konnichiwa~ {user}... ah~ confia na Hinori… esse horário sempre pede um lunchbox 🤗"
    ],

    night: [
        "Konbanwa~ {user}! Pode vir… já deixo seu pedido encaminhado 😊📋",
        "Boa noite~ {user}! Climinha perfeito pra um frango crocante… o que vai ser? 😌",
        "Oi oi~ {user}! Acabou de sair um balde quentinho… quer aproveitar? 🤤🍗",
        "Konbanwa~ {user}! Prefere sanduíche ou tirinhas com molho? 😋🍔",
        "Boa noite~ {user}! Posso montar um combo com batata e refri geladinho pra você 😊🥤",

        // ⭐ 
        "Konbanwa~ {user}... hmm~ eu geralmente escolheria um Gran BBQ Bacon 😳🍔 mas posso anotar o seu primeiro..."
    ],

    dawn: [
        "Oh~ olá! Troquei de turno!, pode sentar por aqui {user}... muito soninho, mas pronta pra te atender 🥱📋",
        "Chegando agora, {user}? A noite é uma criança...,vai de Double Crunch com uma coquinha geladinha? 😏🥤",
        "Oi oi~ {user}! A madrugada sussura... tiras de frango com barbecue ou mostarda e mel, que tal? 😋🍗",
        "Oi~ {user}! Chegou de fininho… pode escolher seu pedido… vou só acordar quem tá na grelha 🤭🔥",
        "Turno da madrugada começando! {user}, é só pedir o combo que mata a fome! 😤🍔",

        // ⭐ 
        "Oh~ um cliente a essa hora, {user}... Hinori respeita quem aparece nesse horário 😳 quer pedir algo especial?"
    ]
};

// ⏰ Detecta período do dia
function getPeriod(custom?: string) {
    if (custom) return custom;

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 24) return "night";
    return "dawn";
}

// Mensagem dinâmica
function getRandomMessage(userId: string, serverName: string, period?: string) {
    const selectedPeriod = getPeriod(period);
    const list = messages[selectedPeriod as keyof typeof messages];

    const random = list[Math.floor(Math.random() * list.length)];

    return random
        .replace("{user}", `<@${userId}>`)
        .replace("{server}", serverName);
}

// 🎨 Embed builder
function buildEmbed(message: string) {
    return new EmbedBuilder()
        .setColor(0xe9692c)
        .setTitle("✨ Bem-vindo(a) ao KFC!")
        .setDescription(message)
        .setFooter({
            text: "Hinori • sua atendente favorita 🧡"
        });
}

// Evento Autómático de Boas-Vindas
createEvent({
    name: "welcomeMember",
    event: "guildMemberAdd",

    async run(member) {
        const guildMember = member as GuildMember;

        const channel = guildMember.guild.channels.cache.get(CHANNEL_ID);
        if (!channel || !channel.isTextBased()) return;

        const selectedPeriod = getPeriod();

        const message = getRandomMessage(
            guildMember.user.id,
            guildMember.guild.name,
            selectedPeriod
        );

        await channel.send({
            embeds: [buildEmbed(message)]
        });
    }
});

// Função de Teste
createCommand({
    name: "tw",
    description: "Test welcome message with custom period",
    type: ApplicationCommandType.ChatInput,

    options: [
        {
            name: "period",
            description: "Choose the time period",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Morning 🌅", value: "morning" },
                { name: "Afternoon ☀️", value: "afternoon" },
                { name: "Night 🌙", value: "night" },
                { name: "Dawn 🌌", value: "dawn" }
            ]
        }
    ],

    async run(interaction) {
        const period = interaction.options.getString("period") || undefined;

        const selectedPeriod = getPeriod(period);

        const message = getRandomMessage(
            interaction.user.id,
            interaction.guild?.name || "server",
            selectedPeriod
        );

        await interaction.reply({
            embeds: [buildEmbed(message)],
            flags: ["Ephemeral"]
        });
    }
});