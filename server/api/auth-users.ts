import { defineEventHandler } from 'h3';

export default defineEventHandler(async () => {
  try {
    const users = await fetchAuthUsers();
    return { users };
  } catch (err) {
    return { error: err.message };
  }
});
