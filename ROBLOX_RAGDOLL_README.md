# Roblox Ragdoll Script - R6/R15 Compatible

A comprehensive ragdoll script for Roblox that works with both R6 and R15 character rigs, allowing players to toggle ragdoll physics on and off by pressing the R key.

## Features

- ✅ **R6 and R15 Support**: Automatically detects character rig type and works with both
- 🎮 **Toggle with R Key**: Press R to enable/disable ragdoll mode
- 🎯 **Realistic Physics**: Uses BallSocketConstraints for natural limb movement
- 🔄 **Fully Reversible**: Restores normal movement when toggling off
- 💀 **Death Handling**: Properly cleans up on character death
- 🔁 **Respawn Ready**: Works correctly after character respawn
- ⚡ **Performance Optimized**: Efficient joint management

## Installation

### Method 1: Roblox Studio (Recommended)

1. Open your Roblox game in Roblox Studio
2. In the Explorer window, navigate to:
   ```
   StarterPlayer > StarterCharacterScripts
   ```
3. Insert a new LocalScript (Right-click > Insert Object > LocalScript)
4. Rename the LocalScript to "RagdollScript"
5. Copy the contents of `src/RagdollScript.lua` and paste it into the LocalScript
6. Save your game

### Method 2: Direct File Import

1. Download the `src/RagdollScript.lua` file
2. In Roblox Studio, right-click on `StarterPlayer > StarterCharacterScripts`
3. Select "Insert from File"
4. Choose the downloaded `RagdollScript.lua` file

## Usage

### In-Game

1. Join the game
2. Press the **R** key to activate ragdoll mode
3. Your character will become physics-based and fall/react to forces
4. Press **R** again to deactivate ragdoll and return to normal movement

### Customization

You can customize the ragdoll key by modifying this line in the script:

```lua
local RAGDOLL_KEY = Enum.KeyCode.R
```

Change `Enum.KeyCode.R` to any other key code (e.g., `Enum.KeyCode.G`, `Enum.KeyCode.F`, etc.)

### Adjusting Physics

You can fine-tune the ragdoll physics by modifying the BallSocketConstraint properties in the `createRagdollJoint` function:

```lua
ballSocket.UpperAngle = 45          -- Maximum rotation angle (degrees)
ballSocket.TwistLowerAngle = -45    -- Minimum twist angle (degrees)
ballSocket.TwistUpperAngle = 45     -- Maximum twist angle (degrees)
```

- **Lower values**: More restricted, stiffer ragdoll
- **Higher values**: More loose, floppy ragdoll

## How It Works

### Ragdoll Activation

1. **Joint Detection**: Script finds all Motor6D joints in the character (except Root joint)
2. **Joint Storage**: Saves original joint data (Part0, Part1, C0, C1) for restoration
3. **Constraint Creation**: Creates BallSocketConstraints with attachments to replace joints
4. **Joint Removal**: Temporarily removes Motor6D joints from the character
5. **Collision Enable**: Enables collision on all body parts for realistic physics
6. **State Change**: Sets humanoid to Physics state

### Ragdoll Deactivation

1. **Constraint Cleanup**: Destroys all BallSocketConstraints and attachments
2. **Joint Restoration**: Restores original Motor6D joints with saved properties
3. **Collision Reset**: Disables collision on body parts (except Head and HumanoidRootPart)
4. **State Recovery**: Returns humanoid to GettingUp state for smooth transition

### Character Death Handling

- Automatically cleans up ragdoll data when character dies
- Prevents memory leaks and errors on respawn
- Ensures fresh ragdoll state after respawn

### Respawn Handling

- Script restarts with each new character
- All ragdoll data is reset
- Works reliably across multiple deaths and respawns

## Technical Details

### R6 vs R15 Detection

The script automatically detects the rig type using:
```lua
humanoid.RigType == Enum.HumanoidRigType.R15
```

### Joint Management

- **R6**: Typically has 6 Motor6D joints (Neck, Left/Right Shoulder, Left/Right Hip, Root)
- **R15**: Has 15+ Motor6D joints for more detailed limb control
- Script handles both by dynamically finding all Motor6D instances

### Performance Considerations

- Only creates constraints when ragdoll is active
- Properly cleans up all created instances when deactivating
- Uses efficient event connections with cleanup on character removal

## Troubleshooting

### Ragdoll doesn't activate

- Ensure the script is in `StarterPlayer > StarterCharacterScripts`
- Check that the script is a **LocalScript**, not a regular Script
- Verify the game allows LocalScripts to run

### Character gets stuck in ragdoll

- Press R again to deactivate
- If still stuck, reset character (Esc > Reset Character)

### Parts are flying everywhere

- Reduce the angle limits in the BallSocketConstraint settings
- Ensure there are no other scripts interfering with character physics

### Script errors after respawn

- This should not occur with the current implementation
- If it does, check for conflicting scripts that modify Motor6D joints
- Ensure no other scripts are destroying character parts

### R key doesn't work

- Check if another script is using the R key
- Verify `UserInputService` is not disabled
- Make sure you're not typing in a TextBox when pressing R

## Compatibility

- ✅ Works with R6 rigs
- ✅ Works with R15 rigs
- ✅ Compatible with standard Roblox characters
- ✅ Works with custom character models (if they use standard Motor6D structure)
- ✅ Compatible with most game modes
- ⚠️ May conflict with custom character controllers that modify Motor6D joints

## Advanced Usage

### Integrating with Other Scripts

To trigger ragdoll from another script:

```lua
-- Get the ragdoll script
local ragdollScript = player.Character:WaitForChild("RagdollScript")

-- Access functions (you'll need to expose them as ModuleScript or use BindableEvents)
-- Example using RemoteEvent:
local ragdollEvent = Instance.new("BindableEvent")
ragdollEvent.Name = "RagdollToggle"
ragdollEvent.Parent = ragdollScript

-- Fire to toggle ragdoll
ragdollEvent:Fire()
```

### Adding Ragdoll on Death

To make characters ragdoll automatically when they die:

```lua
humanoid.Died:Connect(function()
    enableRagdoll()
end)
```

Add this at the end of the script.

### Ragdoll Duration Timer

To automatically disable ragdoll after a certain time:

```lua
local function enableRagdollTimed(duration)
    enableRagdoll()
    wait(duration)
    disableRagdoll()
end
```

## Credits

- Script Type: LocalScript for Roblox
- Compatibility: R6 and R15 character rigs
- Physics: BallSocketConstraint-based ragdoll system

## License

This script is provided as-is for use in Roblox games. Feel free to modify and adapt it for your needs.

---

**Note**: This is a client-side script (LocalScript) that runs on each player's client. For server-side ragdoll control or replication, additional RemoteEvents and server scripts would be needed.
