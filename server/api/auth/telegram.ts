// File: server/api/auth/telegram.ts

import crypto from 'crypto'
import { defineEventHandler, getQuery, setCookie } from 'h3'


const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

function verifyTelegramLogin(data: any) {
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest()
  const dataCheckString = Object.keys(data)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n')

  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')
  return hmac === data.hash
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const supabase = useSupabaseClient()

  if (!verifyTelegramLogin(query)) {
    return { statusCode: 401, body: { status: 'error', message: 'Invalid login attempt.' } }
  }

  const telegramUserId = query.id
  const telegramFirstName = query.first_name
  const telegramUsername = query.username

  // Check if the user exists in Supabase
  const { data: user, error: userError } = await supabase
    .from('auth.users')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single()

  if (userError && userError.code !== 'PGRST116') { // PGRST116 means user not found
    return { statusCode: 500, body: { status: 'error', message: 'Failed to check user existence in Supabase.' } }
  }

  if (!user) {
    // If no user exists, create a new user in Supabase
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: `${telegramUserId}@telegram.fake`, // Using Telegram user ID as a fake email
      password: crypto.randomBytes(20).toString('hex') // Generate a random password
    })

    if (signUpError) {
      return { statusCode: 500, body: { status: 'error', message: 'Failed to create user in Supabase.' } }
    }

    // Update the new user's metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        telegram_user_id: telegramUserId,
        telegram_username: telegramUsername,
        first_name: telegramFirstName
      }
    })

    if (updateError) {
      return { statusCode: 500, body: { status: 'error', message: 'Failed to update user metadata in Supabase.' } }
    }

    // Set the access token as a cookie
    const { session } = newUser
    const accessToken = session?.access_token
    setCookie(event, 'supabase-auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/'
    })
  } else {
    // User exists, log them in with Supabase
    const { data: supabaseSession, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${telegramUserId}@telegram.fake`,
      password: user.password // Use the stored password (or any other auth method)
    })

    if (signInError) {
      return { statusCode: 500, body: { status: 'error', message: 'Failed to log in user via Supabase.' } }
    }

    // Set the session token as a cookie
    const accessToken = supabaseSession?.session?.access_token // Access the access token
    setCookie(event, 'supabase-auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/'
    })
  }

  // Redirect to dashboard or home after successful login
  return { statusCode: 200, body: { status: 'success', message: 'User logged in successfully.' } }
})
