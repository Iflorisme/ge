# Installation Guide - Roblox Ragdoll Script

This guide will walk you through installing the ragdoll script in your Roblox game.

## Prerequisites

- Roblox Studio installed on your computer
- A Roblox game/place open in Roblox Studio
- Basic understanding of Roblox Studio's Explorer window

## Step-by-Step Installation

### Step 1: Open Roblox Studio

1. Launch Roblox Studio
2. Open your existing game or create a new one (File > New > Baseplate)

### Step 2: Navigate to StarterCharacterScripts

1. In the Explorer window (usually on the right side), find the `StarterPlayer` service
2. If you don't see `StarterPlayer`, click the "View" tab at the top and check "Explorer"
3. Click the arrow next to `StarterPlayer` to expand it
4. You should see `StarterCharacterScripts` inside

**If StarterCharacterScripts doesn't exist:**
- Right-click on `StarterPlayer`
- Select "Insert Object"
- Search for "StarterCharacterScripts"
- Click "OK"

### Step 3: Create the LocalScript

1. Right-click on `StarterCharacterScripts`
2. Select "Insert Object"
3. In the search box, type "LocalScript"
4. Select "LocalScript" and click "OK"
5. Rename the LocalScript to "RagdollScript" (optional but recommended)

### Step 4: Copy the Script Code

1. Open the file `src/RagdollScript.lua` from this repository in a text editor
2. Select all the code (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 5: Paste into Roblox Studio

1. Back in Roblox Studio, double-click the LocalScript you created
2. This will open the Script Editor (usually at the bottom)
3. Select all the default code (Ctrl+A or Cmd+A)
4. Paste the copied code (Ctrl+V or Cmd+V)

### Step 6: Save and Test

1. Save your game (File > Save or Ctrl+S)
2. Click the "Play" button at the top (or press F5)
3. Once your character loads, press the **R** key to test the ragdoll

## Verification

To verify the script is installed correctly:

1. **Check the Explorer**: You should see `RagdollScript` under `StarterPlayer > StarterCharacterScripts`
2. **Check Script Type**: Make sure it says "LocalScript" and not just "Script"
3. **Test in-game**: Press F5 to play, then press R to toggle ragdoll

## Expected Behavior

- **First R press**: Character should go limp and fall with physics
- **Second R press**: Character should stand back up and return to normal movement
- **After death**: Ragdoll should work again when you respawn

## Troubleshooting Installation

### Script doesn't appear in StarterCharacterScripts

- Make sure you right-clicked directly on `StarterCharacterScripts`
- Make sure you selected "LocalScript" not "Script"

### Can't find StarterPlayer

- Click "View" at the top menu
- Make sure "Explorer" is checked
- StarterPlayer is a default service, it should always be there

### Script Editor won't open

- Try double-clicking the script again
- If still not working, go to View > Script Editor
- Select your script from the dropdown at the top of the editor

### Code looks wrong after pasting

- Make sure you copied the entire script from the .lua file
- The first line should be a comment: `--[[`
- The last line should be: `end)`

## File Structure in Roblox Studio

After installation, your Explorer should look like this:

```
Workspace
ServerScriptService
ServerStorage
ReplicatedStorage
StarterGui
StarterPack
StarterPlayer
  ├── StarterCharacterScripts
  │   └── RagdollScript (LocalScript) ← Your script goes here
  └── StarterPlayerScripts
SoundService
...
```

## Alternative Installation: Rojo/Roblox-TS Users

If you're using Rojo or Roblox-TS for development:

1. Place the `RagdollScript.lua` file in your source directory
2. Configure your `default.project.json` to sync it to `StarterPlayer.StarterCharacterScripts`
3. Run `rojo serve` and sync to Roblox Studio

Example Rojo configuration:

```json
{
  "name": "YourGame",
  "tree": {
    "$className": "DataModel",
    "StarterPlayer": {
      "$className": "StarterPlayer",
      "StarterCharacterScripts": {
        "$className": "StarterCharacterScripts",
        "RagdollScript": {
          "$path": "src/RagdollScript.lua"
        }
      }
    }
  }
}
```

## Next Steps

After successful installation:

1. Read the [ROBLOX_RAGDOLL_README.md](ROBLOX_RAGDOLL_README.md) for customization options
2. Test with both R6 and R15 characters (go to Home > Game Settings > Avatar to change)
3. Customize the ragdoll key or physics properties as needed

## Support

If you encounter issues:

1. Check that the script is a LocalScript, not a regular Script
2. Verify the script is in `StarterPlayer > StarterCharacterScripts`
3. Make sure LocalScripts are enabled in your game settings
4. Check the Output window (View > Output) for any error messages

Common error messages and fixes:

- **"Humanoid not found"**: Make sure you're testing with a character that spawns
- **"Attempt to index nil"**: Verify all code was copied correctly
- **"Permission denied"**: Make sure the script is a LocalScript
