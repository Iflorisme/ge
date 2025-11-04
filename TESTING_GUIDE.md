# Testing Guide - Roblox Ragdoll Script

This guide will help you verify that the ragdoll script is working correctly for both R6 and R15 characters.

## Quick Test Checklist

- [ ] Script activates ragdoll with R key
- [ ] Script deactivates ragdoll with R key
- [ ] Works with R6 characters
- [ ] Works with R15 characters
- [ ] Character falls realistically when ragdolled
- [ ] Character can move normally after deactivating ragdoll
- [ ] Ragdoll works after respawn
- [ ] No errors in Output window

## Test 1: Basic Ragdoll Toggle (R6)

**Setup:**
1. Open your game in Roblox Studio
2. Go to Home > Game Settings > Avatar
3. Set Avatar Type to "R6"
4. Save settings

**Test Steps:**
1. Click Play (F5) to start the game
2. Wait for your character to spawn
3. Press the **R** key
4. **Expected Result**: Character should go limp and fall to the ground with physics
5. Press the **R** key again
6. **Expected Result**: Character should stand up and return to normal movement
7. Try walking around
8. **Expected Result**: Character moves normally

**Pass Criteria:**
- ✅ Character ragdolls when R is pressed
- ✅ Character recovers when R is pressed again
- ✅ No errors in Output window

## Test 2: Basic Ragdoll Toggle (R15)

**Setup:**
1. Stop the game (Shift+F5 or click Stop)
2. Go to Home > Game Settings > Avatar
3. Set Avatar Type to "R15"
4. Save settings

**Test Steps:**
1. Click Play (F5)
2. Wait for your character to spawn
3. Press the **R** key
4. **Expected Result**: Character should ragdoll with more detailed limb physics (R15 has more joints)
5. Press the **R** key again
6. **Expected Result**: Character recovers and can move normally

**Pass Criteria:**
- ✅ Character ragdolls when R is pressed
- ✅ All limbs (arms, legs, torso) react to physics
- ✅ Character recovers when R is pressed again
- ✅ No errors in Output window

## Test 3: Physics Interaction

**Test Steps:**
1. Play the game (F5)
2. Press **R** to activate ragdoll
3. While ragdolled, try to move the character
4. **Expected Result**: Character shouldn't move with WASD keys, only physics
5. Observe how the character reacts to gravity and collisions
6. Press **R** to deactivate
7. Try moving with WASD keys
8. **Expected Result**: Character moves normally

**Pass Criteria:**
- ✅ Character doesn't respond to movement input while ragdolled
- ✅ Physics look natural and smooth
- ✅ Movement returns after deactivating ragdoll

## Test 4: Respawn Handling

**Test Steps:**
1. Play the game (F5)
2. Press **R** to activate ragdoll
3. Press Esc > Reset Character (or run off the map)
4. Wait for respawn
5. Press **R** to activate ragdoll again
6. **Expected Result**: Ragdoll works normally after respawn
7. Press **R** to deactivate
8. **Expected Result**: Recovery works normally

**Pass Criteria:**
- ✅ Ragdoll works after first respawn
- ✅ No errors appear in Output window
- ✅ Script cleans up old ragdoll data properly

## Test 5: Death While Ragdolled

**Test Steps:**
1. Play the game (F5)
2. Press **R** to activate ragdoll
3. While ragdolled, reset character (Esc > Reset Character)
4. Check Output window for errors
5. **Expected Result**: No errors about destroyed joints or parts
6. After respawn, press **R** again
7. **Expected Result**: Ragdoll still works

**Pass Criteria:**
- ✅ No errors when dying while ragdolled
- ✅ Script handles death gracefully
- ✅ Ragdoll works after death and respawn

## Test 6: Multiple Toggles

**Test Steps:**
1. Play the game (F5)
2. Rapidly press **R** multiple times (on/off/on/off)
3. **Expected Result**: Script handles rapid toggling without errors
4. Leave ragdoll ON
5. Wait 5 seconds
6. Press **R** to deactivate
7. **Expected Result**: Deactivation works after extended ragdoll time

**Pass Criteria:**
- ✅ Rapid toggling doesn't cause errors
- ✅ Script doesn't break with multiple activations
- ✅ Long-duration ragdoll deactivates properly

## Test 7: Collision Testing

**Setup:**
1. In Studio, insert a Part into Workspace (Home > Part)
2. Position it above where the character spawns
3. Make it fairly large (e.g., 20x20x20 studs)

**Test Steps:**
1. Play the game (F5)
2. Press **R** to activate ragdoll
3. Move your camera to watch the character
4. **Expected Result**: Character's limbs should collide with the ground and environment
5. If you spawned a part above, it should affect the ragdolled character
6. Press **R** to deactivate
7. **Expected Result**: Character stands up, collisions return to normal

**Pass Criteria:**
- ✅ Limbs collide with environment when ragdolled
- ✅ Collisions feel natural, not jittery
- ✅ Normal collision behavior returns after deactivation

## Test 8: Input Priority

**Setup:**
1. Insert a ScreenGui with a TextBox (StarterGui > Insert Object > ScreenGui, then insert TextBox)
2. Make the TextBox visible and clickable

**Test Steps:**
1. Play the game (F5)
2. Click on the TextBox and type some text
3. While typing in the TextBox, press **R**
4. **Expected Result**: Ragdoll should NOT activate while typing in TextBox
5. Click outside the TextBox
6. Press **R**
7. **Expected Result**: Ragdoll activates normally

**Pass Criteria:**
- ✅ Ragdoll doesn't activate while user is typing in a TextBox
- ✅ Script respects `gameProcessed` parameter
- ✅ Works normally when not typing

## Test 9: Performance Check

**Test Steps:**
1. Play the game (F5)
2. Open Performance Stats (View > Stats > Performance)
3. Note the FPS before ragdoll
4. Press **R** to activate ragdoll
5. Check FPS while ragdolled
6. **Expected Result**: FPS should remain similar (minor drop is acceptable)
7. Press **R** to deactivate
8. **Expected Result**: FPS returns to normal

**Pass Criteria:**
- ✅ No major FPS drop when ragdoll activates
- ✅ FPS recovers after deactivation
- ✅ No memory leaks (test by toggling multiple times)

## Test 10: Edge Case - Jumping While Ragdolling

**Test Steps:**
1. Play the game (F5)
2. Make the character jump (Spacebar)
3. While in mid-air, press **R**
4. **Expected Result**: Character should ragdoll while falling
5. Wait for character to land
6. Press **R** to deactivate while on ground
7. **Expected Result**: Character stands up normally

**Pass Criteria:**
- ✅ Ragdoll works when activated mid-air
- ✅ Character doesn't get stuck after landing
- ✅ Recovery works from any position

## Debugging

If any test fails, check the following:

### Check Output Window

1. Open View > Output
2. Look for error messages in red
3. Common errors and solutions:

**Error: "Humanoid is not a valid member of..."**
- Solution: Ensure script is in StarterCharacterScripts, not elsewhere

**Error: "attempt to index nil value"**
- Solution: Check that all code was copied correctly

**Error: "ServerStorage is not a valid..."**
- Solution: Script is a LocalScript, not a regular Script

### Check Script Location

1. Navigate to StarterPlayer > StarterCharacterScripts
2. Verify the script is there
3. Verify it's a **LocalScript** (should have a blue icon)

### Check Script Execution

Add a print statement at the top of the script to verify it runs:

```lua
print("Ragdoll script loaded!")
```

If you see this in Output when playing, the script is running.

### Check Character Model

1. Play the game
2. Check Explorer for your character in Workspace
3. Expand the character model
4. Verify Motor6D joints exist (should be inside Torso/UpperTorso)

## Advanced Testing

### Test with Custom Characters

If your game uses custom character models:

1. Ensure custom models have Motor6D joints
2. Test ragdoll with custom model
3. Verify joints are properly restored

### Test with Other Scripts

If you have other scripts that modify character:

1. Test ragdoll with those scripts enabled
2. Check for conflicts in Output
3. Ensure ragdoll doesn't interfere with game mechanics

### Network Test

For multiplayer games:

1. Publish game to Roblox
2. Test in actual game (not Studio)
3. Verify ragdoll works online
4. Note: Only the local player sees their own ragdoll (this is a LocalScript)

## Test Results Template

Use this template to record your test results:

```
Test Date: ____________
Roblox Studio Version: ____________

[ ] Test 1: Basic Ragdoll Toggle (R6) - PASS/FAIL
    Notes: ________________________________

[ ] Test 2: Basic Ragdoll Toggle (R15) - PASS/FAIL
    Notes: ________________________________

[ ] Test 3: Physics Interaction - PASS/FAIL
    Notes: ________________________________

[ ] Test 4: Respawn Handling - PASS/FAIL
    Notes: ________________________________

[ ] Test 5: Death While Ragdolled - PASS/FAIL
    Notes: ________________________________

[ ] Test 6: Multiple Toggles - PASS/FAIL
    Notes: ________________________________

[ ] Test 7: Collision Testing - PASS/FAIL
    Notes: ________________________________

[ ] Test 8: Input Priority - PASS/FAIL
    Notes: ________________________________

[ ] Test 9: Performance Check - PASS/FAIL
    Notes: ________________________________

[ ] Test 10: Edge Case - Jumping - PASS/FAIL
    Notes: ________________________________

Overall Result: PASS/FAIL
```

## Conclusion

If all tests pass, the ragdoll script is working correctly! If any tests fail, refer to the debugging section and the main README for troubleshooting steps.
