import { Bot, Context } from "grammy";
import {conversations, type ConversationFlavor } from "@grammyjs/conversations";
import { registerAddLocation } from "./commands/addLocation.js";
import { registerListLocations } from "./commands/listLocations.js";


if (!Bun.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN is not set in environment variables");
    process.exit(1);
}

const bot = new Bot<ConversationFlavor<Context>>(Bun.env.BOT_TOKEN);

async function startBot() {
    try {
        console.log("✅ Initializing bot...");

        bot.catch((err) => {
            console.error("❌ Bot error:", err);
        });

        // Middleware for conversations
        bot.use(conversations());

        console.log("✅ Registering commands...");
        registerAddLocation(bot);
        registerListLocations(bot);

        // Basic commands
        bot.command("start", async (ctx) => {
            await ctx.reply(
                "👋 Welcome! I can help you manage your locations.\n\n" +
                "Available commands:\n" +
                "/add_location - Add a new location\n" +
                "/list_locations - View your saved locations"
            );
        });

        // Start the bot
        await bot.start({
            onStart: (botInfo) => {
                console.log(`✅ Bot ${botInfo.username} started successfully!`);
            },
        });
    } catch (error) {
        console.error("❌ Failed to start bot:", error);
        process.exit(1);
    }
}

startBot();
