// Import required modules from grammy
import { Bot, webhookCallback } from 'https://deno.land/x/grammy@v1.8.3/mod.ts';

// Load environment variables
const TELEGRAM_API_TOKEN = Deno.env.get("TELEGRAM_API_TOKEN");
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

// Ensure environment variables are available
if (!TELEGRAM_API_TOKEN || !TELEGRAM_CHAT_ID) {
  throw new Error("Missing Telegram environment variables.");
}

// Initialize the bot with the token from environment variables
const bot = new Bot(TELEGRAM_API_TOKEN);

// Function to handle sending messages when a new service notification is added
bot.on('message', (ctx) => {
  ctx.reply('Bot is running.');
});

// Set up the webhook callback
const handleTelegramUpdate = webhookCallback(bot, "std/http");

export default async (req: Request) => {
  try {
    // Parse the incoming request from Supabase trigger
    const { record } = await req.json();

    // Extract the service_order_id from the new record
    const { service_order_id } = record;

    // Construct the notification message
    const message = `New Order added: ${service_order_id}`;

    // Send the notification to the chat
    await bot.api.sendMessage(TELEGRAM_CHAT_ID!, message);

    // Return a success response
    return new Response("Notification sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error sending notification", { status: 500 });
  }
};

// Handle incoming requests
serve(handleTelegramUpdate);
