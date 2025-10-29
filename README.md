# Discord Self-Bot with Ping Command

A simple Discord self-bot that responds to the `!ping` command with "pong". This bot runs on your own Discord user account and only responds to commands sent by you.

## ⚠️ Important Disclaimer

**Using self-bots violates Discord's Terms of Service.** This code is provided for educational purposes only. Using self-bots can result in your Discord account being banned. Use at your own risk.

## Features

- Responds to `!ping` command with "pong"
- Only responds to messages from the authenticated user account
- Comprehensive error handling
- Logging to both console and file
- Externalized configuration via environment variables

## Requirements

- Python 3.8 or higher
- A Discord user account
- Your Discord user token

## Installation

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

4. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` and add your Discord user token:
   ```
   DISCORD_TOKEN=your_discord_user_token_here
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

1. Ensure your `.env` file is configured with your Discord token

2. Run the bot:
   ```bash
   python bot.py
   ```

3. Once the bot is running, you should see a message indicating it's logged in

4. In any Discord channel, send the message:
   ```
   !ping
   ```

5. The bot will respond with:
   ```
   pong
   ```

## How It Works

- The bot monitors all messages in channels you have access to
- When it detects a `!ping` command from your account, it responds with "pong"
- Only messages sent by your own account will trigger the response
- All activity is logged to both the console and `bot.log` file

## Error Handling

The bot includes error handling for:
- Missing or invalid Discord tokens
- Permission errors (when the bot can't send messages)
- Network/HTTP errors
- Unexpected exceptions

All errors are logged to help with troubleshooting.

## Logging

The bot maintains logs in two places:
- Console output (real-time)
- `bot.log` file (persistent)

Logs include timestamps and severity levels for easy debugging.

## Project Structure

```
.
├── bot.py              # Main bot implementation
├── requirements.txt    # Python dependencies
├── .env.example       # Example environment configuration
├── .env               # Your actual configuration (not in git)
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Stopping the Bot

To stop the bot, press `Ctrl+C` in the terminal where it's running.

## Troubleshooting

### Bot won't start
- Verify your token is correct in the `.env` file
- Make sure you've installed all dependencies: `pip install -r requirements.txt`
- Check `bot.log` for error messages

### Bot doesn't respond to !ping
- Ensure the bot is running and shows as logged in
- Verify you're sending the command from your own account
- Make sure the command is exactly `!ping` (no extra spaces)
- Check `bot.log` for any error messages

### Login failure
- Your token may have expired or been invalidated
- You may need to get a new token following the steps above
- Ensure there are no extra spaces in your `.env` file

## Security Notes

- Never commit your `.env` file to version control
- Never share your Discord token with anyone
- The `.gitignore` file is configured to exclude `.env` from git
- If your token is ever compromised, change your Discord password immediately

## License

This project is provided as-is for educational purposes only.
