# Discord Account Generator Bot

An automated Discord self-bot that generates accounts using the `/pgen` command with AI-powered CAPTCHA solving capabilities.

## ⚠️ Important Disclaimer

**Using self-bots violates Discord's Terms of Service.** This code is provided for educational purposes only. Using self-bots can result in your Discord account being banned. Use at your own risk.

## Features

- 🤖 Automated account generation with `/pgen` command
- 🎯 Target specific channel and bot for generation
- 📊 Real-time console UI with progress tracking
- 🧠 AI-powered CAPTCHA solving using Pollinations AI (OpenAI GPT-5 Nano with vision)
- ⏱️ Automatic cooldown management (3 seconds between gens)
- 📧 Automatic credential extraction from DMs
- 🔄 Handles generation limits (max 5 before CAPTCHA)
- 🎨 Clean console interface with progress bars

## Requirements

- Python 3.8 or higher
- A Discord user account
- Your Discord user token
- Access to the target channel and bot

## Configuration

The bot is pre-configured with:
- **Channel ID:** `1422966181966516458`
- **Bot ID:** `1312131736691277914`
- **Max Generations:** 5 (before CAPTCHA)
- **Cooldown:** 3 seconds between generations

## Installation

### For Replit (Recommended)

1. Fork or import this repl to your Replit account

2. Set up your Discord token in Replit Secrets:
   - Click on "Tools" > "Secrets" (or the lock icon 🔒 in the left sidebar)
   - Add a new secret:
     - **Key:** `token`
     - **Value:** Your Discord user token (see below for how to get it)

3. Click the "Run" button

### For Local Development

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` and add your Discord user token:
   ```
   token=your_discord_user_token_here
   ```

6. Run the bot:
   ```bash
   python bot.py
   ```

## Getting Your Discord Token

1. Open Discord in your web browser (NOT the desktop app)
2. Press `F12` to open Developer Tools
3. Go to the "Network" tab
4. Press `Ctrl+R` (or `Cmd+R` on Mac) to reload the page
5. Type `/api` in the filter box
6. Click on any request and look for the "authorization" header in the Request Headers
7. Copy the token value (this is your user token)

**⚠️ NEVER share your user token with anyone! Treat it like a password.**

## Usage

1. Start the bot (it will automatically log in)

2. You'll see a welcome screen with bot information

3. Enter the stock name when prompted:
   ```
   Select Stock to gen: Netflix
   ```

4. Enter how many accounts to generate:
   ```
   How much to gen: 3
   ```

5. The bot will:
   - Clear the console and show a progress UI
   - Send `/pgen stock:{stock}` commands to the target channel
   - Wait for the bot to respond with generated accounts
   - Automatically extract credentials from DMs
   - Handle CAPTCHAs automatically using AI vision
   - Display all generated accounts at the end

## How It Works

### Account Generation Process

1. **Command Execution:** Bot sends `/pgen stock:{stock}` to the configured channel
2. **Response Detection:** Monitors for success embed with "Generated" or "Check your DMs"
3. **Credential Extraction:** Parses DM messages for username and password
4. **Cooldown:** Waits 3 seconds before next generation
5. **Limit Tracking:** Counts successful generations (max 5)

### CAPTCHA Handling

When the bot detects a CAPTCHA (after 5 generations):

1. **Detection:** Identifies CAPTCHA embed with "CAPTCHA Required" title
2. **Image Extraction:** Gets the CAPTCHA image URL from the embed
3. **AI Solving:** Sends image to Pollinations AI (OpenAI GPT-5 Nano with vision)
4. **Code Extraction:** AI returns the CAPTCHA code
5. **Button Click:** Clicks the "Verify Captcha" button
6. **Modal Submission:** Fills and submits the Discord modal with the code
7. **Continue:** Resets counter and continues generation

### Console UI

The bot provides a clean console interface:

```
============================================================
  GENERATION IN PROGRESS
============================================================
Stock: Netflix
Target: 3 accounts
============================================================

[████████████████████████████░░░░░░░░░░░░░░░░░░░░░░] 60% (3/5)
✓ Gen #1 successful!
📧 Received credentials: user@example.com
⏳ Cooldown 3s... Done!
```

## Features Breakdown

### Progress Tracking
- Real-time progress bar with percentage
- Generation counter (current/target)
- Success notifications

### Error Handling
- Connection errors
- Permission errors
- Timeout detection (30s per generation)
- CAPTCHA solving failures
- Graceful error recovery

### AI CAPTCHA Solving
- Uses Pollinations AI API
- OpenAI GPT-5 Nano model with vision
- Automatic image download and encoding
- Smart code extraction (alphanumeric only)
- Retry logic for failed attempts

### Credential Management
- Automatic extraction from DM embeds
- Clean formatting (username:password)
- Final summary with all generated accounts
- Easy copy-paste format

## Configuration Options

You can modify these constants in `bot.py`:

```python
CHANNEL_ID = 1422966181966516458  # Target channel
BOT_ID = 1312131736691277914      # Target bot
MAX_GENS = 5                       # Max gens before CAPTCHA
COOLDOWN = 3                       # Seconds between gens
```

## Troubleshooting

### Bot won't start
- Verify your token is set correctly in Replit Secrets or `.env`
- Make sure you've installed all dependencies
- Check that you're using Python 3.8+

### No response from bot
- Verify the channel ID is correct
- Ensure you have access to the channel
- Check that the bot ID matches the target bot
- Verify the slash command format is correct

### CAPTCHA not solving
- Check your internet connection
- Verify Pollinations AI is accessible
- The AI might need multiple attempts
- Check console for detailed error messages

### Credentials not received
- Ensure you have DMs enabled
- Check that the bot is sending DMs
- Verify the embed parsing is working
- Look for credentials in console output

### Login failure
- Your token may have expired
- You may need to get a new token
- Ensure there are no extra spaces in your token
- Change your Discord password if token is compromised

## Security Notes

- Never commit your `.env` file to version control
- Never share your Discord token with anyone
- Use Replit Secrets for token storage on Replit
- The `.gitignore` file is configured to exclude `.env`
- If your token is compromised, change your password immediately

## Project Structure

```
.
├── bot.py              # Main bot implementation
├── requirements.txt    # Python dependencies
├── .env.example       # Example environment configuration
├── .env               # Your actual configuration (not in git)
├── .replit            # Replit configuration
├── replit.nix         # Replit Nix configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Dependencies

- `discord.py-self` - Discord self-bot library
- `python-dotenv` - Environment variable management
- `aiohttp` - Async HTTP client for API calls
- `requests` - HTTP library for API requests
- `Pillow` - Image processing library

## API Integration

### Pollinations AI

The bot uses Pollinations AI for CAPTCHA solving:
- **Endpoint:** `https://text.pollinations.ai/`
- **Model:** OpenAI GPT-5 Nano (with vision support)
- **Features:** Text and image input, vision capabilities
- **Cost:** Free (anonymous tier)

## Legal Notice

This software is provided as-is for educational purposes only. The developers are not responsible for:
- Account bans or suspensions
- Terms of Service violations
- Misuse of the software
- Any damages resulting from use

Use at your own risk and ensure compliance with all applicable terms of service and laws.

## License

This project is provided as-is for educational purposes only.

---

**Made for Replit** 🚀
