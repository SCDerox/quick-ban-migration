const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});
const config = require('./config.json')

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}. Migrating bans...`);
    const oldServer = await client.guilds.fetch(config.oldServer).catch(() => {})
    if (!oldServer) return console.error('Old server could not be found')
    const newServer = await client.guilds.fetch(config.newServer).catch(() => {})
    if (!newServer) return console.error('New server could not be found')
    console.log(`Migrating form ${oldServer.name} to ${newServer.name}...`)
    const bans = await oldServer.bans.fetch({cache: false}).catch(() => {});
    if (!bans) return console.error('Could not fetch bans. Do I have enough permissions to do this?');
    for (const ban of bans.values()) {
        await newServer.bans.create(ban.user, {
            reason: `[IMPORTED] ${ban.reason}`
        }).then(() => console.log(`Banned ${ban.user.tag} successfully`)).catch(() => console.error(`Could not ban ${ban.user.tag}. Do I have enough permissions to ban this user?`))
    }
    console.log('\n\nDone migrating bans.');
    client.destroy();
})

client.login(config.token)