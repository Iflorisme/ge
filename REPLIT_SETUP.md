# Replit Setup Guide

## Quick Start (3 Steps)

### Step 1: Set Your Discord Token
1. Click on **Tools** → **Secrets** (or the 🔒 lock icon in left sidebar)
2. Click "**+ New Secret**"
3. Enter:
   - **Key:** `token`
   - **Value:** `your_discord_user_token_here`
4. Click "**Add Secret**"

### Step 2: Run the Bot
Open the **Shell** tab and type:
```bash
./run.sh
```

Or alternatively:
```bash
python3 bot.py
```

### Step 3: Use the Bot
Follow the on-screen prompts:
1. Enter the stock name (e.g., `Netflix`)
2. Enter how many to generate (e.g., `3`)
3. Watch the magic happen! ✨

---

## Troubleshooting

### ❌ "Workflows" Message?
If you see a message about Workflows when clicking "Run", just ignore it and use the Shell instead:
```bash
./run.sh
```

### ❌ Token Not Found?
Make sure you set the secret with the exact key name: `token` (lowercase)

### ❌ Permission Denied on run.sh?
Run this first:
```bash
chmod +x run.sh
```

### ❌ Module Not Found?
Install dependencies manually:
```bash
pip install -r requirements.txt
```

---

## How to Get Your Discord Token

1. Open **Discord** in your **web browser** (not the app!)
2. Press **F12** to open Developer Tools
3. Go to the **Network** tab
4. Press **Ctrl+R** to reload
5. Type `/api` in the filter box
6. Click any request → Look for **authorization** in Headers
7. Copy the token value

⚠️ **NEVER SHARE YOUR TOKEN!** It's like your password.

---

## Alternative Run Commands

If `./run.sh` doesn't work, try these:

```bash
# Method 1: Direct Python
python3 bot.py

# Method 2: With dependency install
pip install -r requirements.txt && python3 bot.py

# Method 3: Using bash
bash run.sh
```

---

## File Structure

```
.
├── bot.py                 # Main bot code
├── run.sh                 # Easy run script
├── requirements.txt       # Dependencies
├── .replit               # Replit config
├── replit.nix            # Nix environment
└── REPLIT_SETUP.md       # This file
```

---

## Support

Having issues? Check:
1. Token is set correctly in Secrets
2. Dependencies are installed: `pip install -r requirements.txt`
3. Using Python 3.11+: `python3 --version`
4. You have access to the target Discord channel

---

**Made for Replit** 🚀
