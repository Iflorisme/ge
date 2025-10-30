# Guild ID Fix Guide

## The Problem

You're seeing these errors:
- **Status 404**: Guild not found - You're not in that guild
- **Status 400/403**: Permission issues

This means the GUILD_ID in bot.py is wrong or you're not in that server.

## The Solution

### Step 1: Run the Bot

When you run the bot now, you'll see:

```
🔍 Verifying guild access...
   You are in X guild(s):
   - Server Name 1 (ID: 111111111111111111)
   - Server Name 2 (ID: 222222222222222222) ← TARGET
   - Server Name 3 (ID: 333333333333333333)
```

### Step 2: Find Your Server

Look at the list of guilds. Find the server where the bot with `/pgen` command is located.

**If you see "← TARGET"** next to a server name:
- That's the configured server (Guild ID: 1422819189802139660)
- If this is the WRONG server, continue to Step 3

**If you DON'T see "← TARGET"**:
- The configured Guild ID `1422819189802139660` is wrong
- You need to find the correct server from the list

### Step 3: Get the Correct Guild ID

1. **Enable Developer Mode in Discord:**
   - Settings → Advanced → Developer Mode: ON

2. **Get the Server ID:**
   - Right-click the server icon
   - Click "Copy Server ID"
   - This is your Guild ID!

### Step 4: Update bot.py

Edit `bot.py` line 15:

```python
# OLD (line 15)
GUILD_ID = 1422819189802139660

# NEW (replace with your server's ID)
GUILD_ID = YOUR_SERVER_ID_HERE
```

### Step 5: Verify Channel and Bot

Make sure:

1. **The channel exists in that server:**
   - Right-click the channel → Copy Channel ID
   - Update CHANNEL_ID in bot.py line 13 if needed

2. **The bot is in that server:**
   - Look for bot `1312131736691277914` in the member list
   - If it's a different bot, update BOT_ID in bot.py line 14

## Example Fix

Let's say the bot shows:

```
   You are in 3 guild(s):
   - My Gaming Server (ID: 987654321987654321) ← TARGET
   - Crypto Trading (ID: 123456789123456789)
   - Friends Hangout (ID: 555666777888999000)
```

And you want to use "Crypto Trading" instead:

**Edit bot.py:**
```python
GUILD_ID = 123456789123456789  # Changed to Crypto Trading
```

## Verification

After fixing, you should see:

```
🔍 Verifying guild access...
   You are in 3 guild(s):
   - My Gaming Server (ID: 987654321987654321)
   - Crypto Trading (ID: 123456789123456789) ← TARGET
   - Friends Hangout (ID: 555666777888999000)

✅ Guild verified: Crypto Trading
✅ Channel verified: #general

🔍 Searching for /pgen command from bot 1312131736691277914
   In guild: 123456789123456789
```

## Still Having Issues?

### Error: "Cannot access channel"
- You don't have permission to see that channel
- Update CHANNEL_ID to a channel you CAN see

### Error: "Command not found"
- The bot might not be in that server
- Or the command name isn't "pgen"
- Type `/` in Discord and check available commands

### Error: "No guilds found"
- Your user account isn't in any servers
- Join some Discord servers first!

---

## Quick Reference

**To change target server:**
```python
# bot.py lines 13-15
CHANNEL_ID = your_channel_id
BOT_ID = your_bot_id
GUILD_ID = your_server_id  # ← Change this!
```

**To get IDs in Discord:**
1. Enable Developer Mode (Settings → Advanced)
2. Right-click → Copy ID

---

**After making changes, restart the bot!**
