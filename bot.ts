import { Bot } from "grammy";
import { config } from "dotenv";

config();

const bot = new Bot(process.env.BOT_TOKEN!);

bot.command("start", (ctx) => ctx.reply("Working..."));
bot.on("message", (ctx) => ctx.reply("Message Recieved"));

bot.start();

