# Changelog

## [Latest] - Slash Command Fix

### Fixed
- **Slash Command Execution**: Bot now properly executes the `/pgen` slash command instead of sending it as a text message
  - Implemented proper Discord API interaction system
  - Added automatic command ID fetching from the target bot
  - Uses Discord v9 interactions API endpoint
  - Includes proper payload structure with application_id, guild_id, channel_id, and session_id

### Added
- `fetch_command_id()` method: Automatically discovers the `/pgen` command ID from the target bot
- `pgen_command_id` attribute: Stores the command ID for proper invocation
- Better error handling with status code checks and helpful hints

### Technical Details
The bot now:
1. Fetches available slash commands from the guild on startup
2. Finds the `/pgen` command and stores its ID
3. Uses the Discord interactions API to properly invoke the command
4. Sends proper interaction payloads instead of text messages

### How It Works
```
User Token → Discord API v9 → Interactions Endpoint → Bot receives slash command
```

The bot sends a proper interaction payload that mimics what the Discord client would send when a user clicks a slash command.

---

## Configuration

The bot is configured for:
- **Target Channel**: 1422966181966516458
- **Target Bot**: 1312131736691277914  
- **Command**: `/pgen stock:<name>`
- **Max Gens**: 5 (before CAPTCHA)
- **Cooldown**: 3 seconds

---

## Usage

```bash
# Run on Replit
./run.sh

# Or directly
python3 bot.py
```

Then follow the prompts to generate accounts!
