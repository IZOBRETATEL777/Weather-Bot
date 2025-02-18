import { Bot, Context } from "grammy";
import { Conversation, createConversation, type ConversationFlavor} from "@grammyjs/conversations";

async function askLocation(conversation: Conversation, ctx: Context) {
    await ctx.reply('Please enter your location');
    const { message } = await conversation.waitFor("message:text");

    if (!message.text) {
        await ctx.reply('Please enter a valid location');
        return;
    }

    await ctx.reply(`You entered: ${message.text}`);
    // TODO: Add DB logic to save location
}

export function registerAddLocation(bot: Bot<ConversationFlavor<Context>>) {
    bot.use(createConversation(askLocation));

    bot.command("add_location", async (ctx) => {
        await ctx.conversation.enter("askLocation");
    });
}
