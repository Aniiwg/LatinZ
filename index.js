require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const PREFIX = 'z!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* ===== SLASH COMMANDS ===== */
client.slashCommands = new Collection();
const slashFiles = fs.readdirSync('./commands/slash').filter(f => f.endsWith('.js'));

for (const file of slashFiles) {
  const command = require(`./commands/slash/${file}`);
  client.slashCommands.set(command.data.name, command);
}

/* ===== PREFIX COMMANDS ===== */
client.prefixCommands = new Collection();
const prefixFiles = fs.readdirSync('./commands/prefix').filter(f => f.endsWith('.js'));

for (const file of prefixFiles) {
  const command = require(`./commands/prefix/${file}`);
  client.prefixCommands.set(command.name, command);
}

/* ===== BOT READY ===== */
client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const statuses = [
    { name: 'Jugando en Latin Z ⛏️', type: 0 }, // PLAYING// WATCHING
    { name: 'Protegiendo el servidor 🛡️', type: 0 },
    { name: 'Picando diamantes 💎', type: 0 }
  ];

  let i = 0;

  // status inmediato (IMPORTANTE)
  client.user.setPresence({
    activities: [statuses[i]],
    status: 'online'
  });

  setInterval(() => {
    i = (i + 1) % statuses.length;

    client.user.setPresence({
      activities: [statuses[i]],
      status: 'online'
    });

    console.log('🔄 Status cambiado a:', statuses[i].name);
  }, 30000); // 30 segundos
});
/* ===== SLASH HANDLER ===== */
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: '❌ Error en el comando', ephemeral: true });
  }
});

/* ===== PREFIX HANDLER ===== */
client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  command.execute(message, args, client);
});

client.login(process.env.TOKEN);