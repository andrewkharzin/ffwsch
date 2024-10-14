<template>
  <div class="login-page">
    <h1>Login with Telegram</h1>
    <!-- Container where Telegram login widget will be rendered -->
    <div ref="telegramButton" class="telegram-login-button"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Declare refs and Supabase client
const telegramButton = ref(null);

onMounted(() => {
  // Load the Telegram login widget script
  const script = document.createElement("script");
  script.src = "https://telegram.org/js/telegram-widget.js?7"; // Ensure this URL is correct
  script.async = true;
  const supabase = useSupabaseClient();

  // Add an onload event listener to check if the script loads
  script.onload = () => {
    console.log("Telegram widget script loaded successfully.");

    if (window.TelegramLoginWidget) {
      // Initialize the Telegram Login Widget
      window.TelegramLoginWidget.create({
        botName: useRuntimeConfig().TELEGRAM_BOT_NAME, // Use the bot name from the environment variables
        dataHash: useRuntimeConfig().TELEGRAM_DATA_HASH, // Use the data hash from the environment variables
        requestAccess: "write",
        container: telegramButton.value, // Reference to the container div
        onAuth: async (data) => {
          // Handle Telegram authentication response
          console.log("Authenticated with Telegram:", data);

          // Send the data to the backend for verification and login
          const response = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (result.status === "success") {
            // Redirect to the dashboard or another protected route
            window.location.href = "/dashboard"; // Change to your desired route
          } else {
            console.error("Login failed:", result.message);
          }
        },
      });
    } else {
      console.error("TelegramLoginWidget is not defined");
    }
  };

  // Handle script load error
  script.onerror = () => {
    console.error("Failed to load Telegram widget script");
  };

  // Append the script to the document
  document.body.appendChild(script);
});
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.telegram-login-button {
  margin-top: 20px;
}
</style>
