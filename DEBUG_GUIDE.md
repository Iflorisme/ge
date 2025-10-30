# Debug Guide for Slash Command Issues

## What The Bot Does

The bot now has improved command fetching with these steps:

1. **Fetch all guild commands** - Gets all slash commands available in the guild
2. **Find /pgen command** - Searches for the `pgen` command from BOT_ID `1312131736691277914`
3. **Store command ID** - Saves the command ID for proper invocation
4. **Send interaction** - Uses Discord API to invoke the slash command

## When You See "Command response: 400"

This means one of these issues:

### Issue 1: Command ID Not Found
**Symptoms:**
```
⚠️  /pgen command not found in guild commands
```

**Solutions:**
- Make sure the bot (`1312131736691277914`) is in the guild
- Verify the command is registered: Type `/pgen` in Discord and see if it auto-completes
- Check if you have permission to see the command

### Issue 2: Wrong Command Structure
**Symptoms:**
```
⚠️  Slash command failed (Status 400)
```

**Solutions:**
- The command options might have changed
- Check the bot's actual command structure by typing `/pgen` in Discord
- Note the exact parameter names (might not be `stock`)

### Issue 3: Missing Permissions
**Symptoms:**
- 403 errors
- "Missing Access" messages

**Solutions:**
- Ensure you're in the correct channel (`1422966181966516458`)
- Verify you have permission to use slash commands in that channel
- Check if the bot has restricted the command to certain roles

## Debug Mode

The bot now shows detailed information:

```
🔍 Fetching command information...
📋 Found X commands in guild
✓ Found /pgen command!
  ID: 123456789
  Version: 1234567890
  Application: 1312131736691277914
```

If you don't see this, the command wasn't found.

## Manual Testing

You can test if the command works manually:

1. Go to Discord channel `1422966181966516458`
2. Type `/pgen` and see if it autocompletes
3. Fill in the stock parameter
4. See if it works manually

If it doesn't work manually, the bot can't make it work either.

## Fallback Mode

When the command ID isn't found, the bot will:
1. Send `/pgen stock:{name}` as a text message
2. Print a warning that you need to manually trigger it

This means you'll see the text in chat but it won't execute automatically.

## Common Fixes

### Fix 1: Make Sure Bot is in Guild
The target bot must be in the same server as channel `1422966181966516458`.

### Fix 2: Verify Command Name
Check if the command is actually called `pgen` or something else like:
- `premium-gen`
- `p-gen`
- `generator`

### Fix 3: Check Parameter Names
The parameter might not be called `stock`. Check in Discord what the actual parameter name is.

### Fix 4: Update Bot/Channel IDs
Make sure these are correct in `bot.py`:
```python
CHANNEL_ID = 1422966181966516458
BOT_ID = 1312131736691277914
```

## Advanced Debugging

If you want to see ALL commands available, you can temporarily add this after line 77:

```python
for cmd in commands:
    print(f"  - /{cmd.get('name')} (App: {cmd.get('application_id')})")
```

This will show all available slash commands in the guild.

## Still Not Working?

If the command still doesn't work:

1. **Check the bot's documentation** - See if there are specific requirements
2. **Verify permissions** - Make sure your account can use the command
3. **Try manual invocation** - If it works manually, the bot should work too
4. **Check rate limits** - Discord might be rate limiting your requests
5. **Verify token** - Make sure your user token is valid and not expired

---

## Success Indicators

When everything works, you should see:

```
🔍 Fetching command information...
📋 Found 15 commands in guild
✓ Found /pgen command!
  ID: 1234567890123456789
  Version: 1234567890123456789
  Application: 1312131736691277914

Select Stock to gen: Netflix
How much to gen: 3

============================================================
  GENERATION IN PROGRESS
============================================================
Stock: Netflix
Target: 3 accounts
============================================================

[████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% (1/3)
✓ Gen #1 successful!
📧 Received credentials: user@example.com
```

---

**Need more help?** Check the bot's output carefully - it now prints detailed debug information!
