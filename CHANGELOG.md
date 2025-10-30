# Changelog

## [Latest] - Enhanced Slash Command with Debug Info

### Fixed
- **Slash Command Execution**: Bot now properly executes the `/pgen` slash command instead of sending it as a text message
  - Implemented proper Discord API interaction system
  - Added automatic command ID fetching from the target bot
  - Uses Discord v9 interactions API endpoint
  - Includes proper payload structure with application_id, guild_id, channel_id, and session_id
- **Command Fetching**: Improved command discovery with multiple fallback methods
  - Searches all guild commands first
  - Falls back to application commands if guild search fails
  - Validates bot ID matches to ensure correct command
- **Error Handling**: Much better error messages and debugging info
  - Shows number of commands found
  - Displays command ID, version, and application ID when found
  - Provides detailed error messages with status codes
  - Includes fallback to text messages when command ID not found

### Added
- `fetch_command_id()` method: Automatically discovers the `/pgen` command ID from the target bot
  - Multiple fallback methods for finding commands
  - Detailed console output for debugging
  - Version and application ID verification
- `pgen_command_id` attribute: Stores the command ID for proper invocation
- Better error handling with status code checks and helpful hints
- Full traceback on errors for debugging
- Fallback mode: Sends text message if command ID not found
- DEBUG_GUIDE.md: Comprehensive troubleshooting guide

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
