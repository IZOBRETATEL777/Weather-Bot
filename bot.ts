import { Bot } from "grammy";
import { config } from "dotenv";

import { registerAddLocation } from "./commands/addLocation.js";

config();

const bot = new Bot(process.env.BOT_TOKEN!);
registerAddLocation(bot);

bot.command("start", (ctx) => ctx.reply("Working..."));

bot.start();

