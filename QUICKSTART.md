# Quick Start Guide - Roblox Ragdoll Script

Get up and running in 5 minutes!

## 1. Install (1 minute)

1. Open your Roblox game in Studio
2. Navigate to: `StarterPlayer > StarterCharacterScripts`
3. Insert a new `LocalScript`
4. Copy the code from `src/RagdollScript.lua` into the LocalScript
5. Save your game

## 2. Test (1 minute)

1. Press **F5** to play
2. Press **R** to ragdoll
3. Press **R** again to stand up

## 3. Done! ✅

Your ragdoll system is now working!

---

## Key Information

| Feature | Details |
|---------|---------|
| **Activation Key** | R (customizable in code) |
| **Supported Rigs** | R6 and R15 (auto-detected) |
| **Script Type** | LocalScript |
| **Location** | StarterPlayer > StarterCharacterScripts |
| **File to Use** | `src/RagdollScript.lua` |

## Behavior

- **First R press**: Character goes limp and falls with physics
- **Second R press**: Character stands up and returns to normal
- **On death**: Automatically cleans up ragdoll
- **On respawn**: Works normally again

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Doesn't work | Make sure it's a **LocalScript**, not Script |
| Can't find location | Go to View > Explorer, find StarterPlayer |
| Errors in Output | Check that all code was copied correctly |
| Wrong key | Change `RAGDOLL_KEY = Enum.KeyCode.R` to another key |

## Customization

Want to change the ragdoll physics? Edit these values in the code:

```lua
ballSocket.UpperAngle = 45          -- Default: 45
ballSocket.TwistLowerAngle = -45    -- Default: -45
ballSocket.TwistUpperAngle = 45     -- Default: 45
```

- **Lower values** = Stiffer ragdoll
- **Higher values** = Looser ragdoll

## Need More Help?

- 📖 Full documentation: [ROBLOX_RAGDOLL_README.md](ROBLOX_RAGDOLL_README.md)
- 🔧 Installation guide: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- 🧪 Testing guide: [TESTING_GUIDE.md](TESTING_GUIDE.md)

## Advanced Users

Want more features? Check out `src/RagdollScriptAdvanced.lua` for:
- Debug messages
- Configurable physics
- Enhanced error handling
- Collision group support

---

**That's it!** Enjoy your new ragdoll system! 🎮
