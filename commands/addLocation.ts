import { Context, Bot } from "grammy";

const GEO_API_URL = "http://api.openweathermap.org/geo/1.0/direct"
const userLocations: Record<number, string[]> = {};

// Helper function to normalize city names using OpenWeather Geocoding API
async function normalizeCity(city: string): Promise<string> {
    try {
        const response = await fetch(`${GEO_API_URL}?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}`);
        if (!response.ok) throw new Error(`OpenWeather API request failed with status: ${response.status}`);

        const data = await response.json();
        if (data.length === 0) return city; // Return original name if no results found

        return `${data[0].name}, ${data[0].country}`;
    } catch (error) {
        console.error("Error normalizing city:", error);
        return city;
    }
}

// Add Location Command Handler
export function addLocation(bot: Bot) {
    bot.command("add_location", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) return;
        ctx.reply("Please send your location or enter a city name.");
    });

    bot.on("message:text", async (ctx: Context) => {
        const userId = ctx.from?.id;
        if (!userId) return;

        const city = await normalizeCity(ctx.message.text);
        if (!userLocations[userId]) userLocations[userId] = [];
        userLocations[userId].push(city);
        ctx.reply(`Location "${city}" has been added to your saved locations.`);
    });
}

