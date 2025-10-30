# Bot Configuration

## Current Settings

The bot is hardcoded with these IDs:

```python
GUILD_ID = 1422819189802139660    # Discord Server ID
CHANNEL_ID = 1422966181966516458  # Target channel for commands
BOT_ID = 1312131736691277914      # Bot that has /pgen command
```

## How to Change

To use different IDs, edit `bot.py` lines 13-15:

```python
CHANNEL_ID = your_channel_id_here
BOT_ID = your_bot_id_here
GUILD_ID = your_guild_id_here
```

## Getting IDs

### Guild/Server ID
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click the server icon → Copy Server ID

### Channel ID
1. Enable Developer Mode (if not already)
2. Right-click the channel → Copy Channel ID

### Bot ID
1. Right-click the bot's profile → Copy User ID
2. Or check the bot's profile URL: `discord.com/users/BOT_ID`

## Command Discovery

The bot will automatically:
1. Search for commands in the specified guild
2. Find the `/pgen` command from the specified bot
3. Store the command ID for execution

The bot tries 3 methods to find the command:
1. **Guild command search** - Searches with query "pgen"
2. **All guild commands** - Fetches and lists all commands
3. **Bot-specific commands** - Direct bot API query

## Verification

When the bot starts, you should see:

```
🔍 Searching for /pgen command from bot 1312131736691277914
   In guild: 1422819189802139660
🌐 Method 1: Searching guild commands...
   Found X total commands
✅ SUCCESS! Found /pgen command!
   Command ID: [command_id_here]
   Version: [version_here]
   Bot ID: 1312131736691277914
```

If you see failures, check:
- The bot is in your server
- You have permission to see the command
- The command exists (type `/pgen` in Discord to test)

## Troubleshooting

### Command Not Found?
- Make sure bot ID `1312131736691277914` is in server `1422819189802139660`
- Type `/pgen` in Discord to verify the command exists
- Check if you need special permissions to see it

### Wrong Server?
Update `GUILD_ID` in bot.py to your server's ID

### Different Bot?
Update `BOT_ID` in bot.py to the correct bot's user ID

---

**Need help?** Check `DEBUG_GUIDE.md` for detailed troubleshooting!
