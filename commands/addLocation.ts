import { Bot, Context } from "grammy";
import { Conversation, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import { db, locations } from "../db.ts";
import { eq } from "drizzle-orm";

// Function to store user location in the database
async function saveLocation(userId: number, city: string) {
    try {
        // ✅ Check if the location already exists for the user
        const existingLocation = await db.select().from(locations).where(eq(locations.user_id, userId)).execute();
        
        if (existingLocation.some((loc) => loc.city === city)) {
            console.log(`ℹ️ Location "${city}" already exists for user ${userId}`);
            return "already_exists";
        }

        // ✅ Insert the new location
        await db.insert(locations).values({ user_id: userId, city }).execute();
        console.log(`✅ Location "${city}" added for user ${userId}`);
        return "success";
    } catch (error) {
        console.error("❌ Error saving location:", error);
        return "error";``
    }
}

// Conversation function to ask for location
async function askLocation(conversation: Conversation, ctx: Context) {
    await ctx.reply('Please enter your location');
    const { message } = await conversation.waitFor("message:text");

    if (!message.text) {
        await ctx.reply('Please enter a valid location');
        return;
    }

    const userId = ctx.from?.id;
    if (!userId) {
        await ctx.reply("❌ Unable to get your user ID.");
        return;
    }

    const city = message.text.trim();

    // ✅ Save location to the database
    const result = await saveLocation(userId, city);

    if (result === "already_exists") {
        await ctx.reply(`ℹ️ Location "${city}" is already in your saved locations.`);
    } else if (result === "success") {
        await ctx.reply(`✅ Location "${city}" has been added to your saved locations.`);
    } else {
        await ctx.reply("❌ An error occurred while saving your location.");
    }
}

// Register the command
export function registerAddLocation(bot: Bot<ConversationFlavor<Context>>) {
    bot.use(createConversation(askLocation));

    bot.command("add_location", async (ctx) => {
        await ctx.conversation.enter("askLocation");
    });
}
