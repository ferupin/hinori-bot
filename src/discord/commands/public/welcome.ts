import { createCommand, createEvent } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, GuildMember } from "discord.js";

const CHANNEL_ID = "1272622205204959245";

const messages = {
    morning: [
        "Ohayou~ {user}! Já posso anotar seu pedido? 🍗",
        "Bom dia, {user}! Vai um lanchinho leve pra começar?",
        "Ohayou~ {user}! Tem pedido fresquinho saindo 🍗",
        "Bom dia, {user}! Quer dar uma olhada no cardápio?",
        "Ohayou~ {user}! Bom horário pra escolher algo com calma 🍗",

        // ⭐ 
        "Ohayou~ {user}... Hinori quase cochilou 😳 mas já posso anotar seu pedido 🍗"
    ],

    afternoon: [
        "Oiee {user}! Hora perfeita pra pedir algo 😋",
        "Boa tarde, {user}! Já decidiu seu lanche?",
        "Oiee {user}! Tá saindo pedido quentinho agora 🔥",
        "Boa tarde, {user}! Posso anotar pra você?",
        "Oiee {user}! Melhor horário pra um lanche caprichado 😆",

        // ⭐ 
        "Oiee {user}! 😳 Confia na Hinori... esse horário sempre pede um lanche bom hehe~"
    ],

    night: [
        "Boa noite, {user}! Vai um lanchinho agora? 🍗",
        "Boa noite, {user}! Climinha perfeito pra pedir algo 😌",
        "Boa noite, {user}! Já escolheu seu pedido?",
        "Boa noite, {user}! Posso anotar pra você?",
        "Boa noite, {user}! Bom momento pra um lanche mais caprichado 🍗",

        // ⭐ 
        "Boa noite, {user}... 😳 Às vezes um pedido agora resolve tudo 🍗"
    ],

    dawn: [
        "Madrugada, {user} Ainda atendendo por aqui 🍗",
        "Hmm~ {user}... Vai querer algo rápido?",
        "Madrugada ativa, {user} Posso anotar?",
        "{user} chegou... Silencioso por aqui 🍗",
        "Turno da madrugada {user}, só pedir",

        // ⭐ 
        "{user}... Hinori respeita quem aparece esse horário 😳 quer algo especial?"
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

// 🕒 Label com emoji + horário
function getPeriodLabel(period: string) {
    const time = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    switch (period) {
        case "morning": return `🌅 Manhã • ${time}`;
        case "afternoon": return `☀️ Tarde • ${time}`;
        case "night": return `🌜 Noite • ${time}`;
        case "dawn": return `🌌 Madrugada • ${time}`;
        default: return `🍗 ${time}`;
    }
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
function buildEmbed(message: string, period: string) {
    return new EmbedBuilder()
        .setColor(0xe9692c)
        .setTitle("✨ Bem-vindo(a) ao KFC!")
        .addFields({
            name: "⠀",
            value: getPeriodLabel(period)
        })
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
            embeds: [buildEmbed(message, selectedPeriod)]
        });
    }
});

// Função de Teste
createCommand({
    name: "testwelcome",
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
            embeds: [buildEmbed(message, selectedPeriod)],
            flags: ["Ephemeral"]
        });
    }
});