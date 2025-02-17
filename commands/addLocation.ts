import { Context, Bot } from "grammy";
import { db, locations } from "../db.js";
import { eq } from "drizzle-orm";

async function normalizeCity(city: string): Promise<string> {
    try {
        const response = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        if (!response.ok) throw new Error(`OpenWeather API request failed with status: ${response.status}`);

        const data = await response.json();
        if (data.length === 0) return city;

        return `${data[0].name}, ${data[0].country}`;
    } catch (error) {
        console.error("Error normalizing city:", error);
        return city;
    }
}

// Function to register commands
export function registerAddLocation(bot: Bot) {
    bot.command("add_location", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        ctx.reply("Please send your location or enter a city name.");
    });

    bot.on("message:text", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        const city = await normalizeCity(ctx.message.text);

        // Check if the location already exists for the user
        const existingLocation = await db.select().from(locations).where(eq(locations.user_id, userId)).execute();

        if (existingLocation.some((loc) => loc.city === city)) {
            return ctx.reply(`Location "${city}" is already in your saved locations.`);
        }

        // Insert new location
        await db.insert(locations).values({ user_id: userId, city }).execute();
        ctx.reply(`Location "${city}" has been added to your saved locations.`);
    });
}

