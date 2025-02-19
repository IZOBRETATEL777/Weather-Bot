import { Bot, Context } from "grammy";
import { Conversation, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import { fetchWeather } from "./../weatherService.ts";
import { db, locations } from "../db.ts";
import { eq } from "drizzle-orm";

async function fetchNormalizedCity(city: string) {
    try {
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${Bun.env.OPENWEATHER_API_KEY}`);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            console.error(`❌ No geolocation data found for city: ${city}`);
            return null;
        }
        
        return `${geoData[0].name}, ${geoData[0].country}`;
    } catch (error) {
        console.error("❌ Error fetching geolocation data:", error);
        return null;
    }
}

// Function to store user location in the database
async function saveLocation(userId: number, city: string) {
    try {
        const normalizedCity = await fetchNormalizedCity(city);
        if (!normalizedCity) {
            return "invalid_city";
        }
        
        const existingLocation = await db.select().from(locations).where(eq(locations.user_id, userId)).execute();
        if (existingLocation.some((loc) => loc.city === normalizedCity)) {
            console.log(`ℹ️ Location "${normalizedCity}" already exists for user ${userId}`);
            return "already_exists";
        }

        await db.insert(locations).values({ user_id: userId, city: normalizedCity }).execute();
        console.log(`✅ Location "${normalizedCity}" added for user ${userId}`);
        await fetchWeather();
        return "success";
    } catch (error) {
        console.error("❌ Error saving location:", error);
        return "error";
    }
}

// Conversation function to ask for location
async function askLocation(conversation: Conversation, ctx: Context) {
    await ctx.reply("Please enter your location");
    const { message } = await conversation.waitFor("message:text");

    if (!message.text) {
        await ctx.reply("Please enter a valid location");
        return;
    }

    const userId = ctx.from?.id;
    if (!userId) {
        await ctx.reply("❌ Unable to get your user ID.");
        return;
    }

    const city = message.text.trim();
    const result = await saveLocation(userId, city);

    if (result === "invalid_city") {
        await ctx.reply("❌ Unable to find a valid location. Please try again.");
    } else if (result === "already_exists") {
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
