local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local REMOTE_NAME = "RagdollToggleEvent"
local AUTO_RECOVER_SECONDS = 12
local SERVER_DEBOUNCE = 0.25

local STATES_TO_DISABLE = {
    Enum.HumanoidStateType.GettingUp,
    Enum.HumanoidStateType.Jumping,
    Enum.HumanoidStateType.Running,
    Enum.HumanoidStateType.RunningNoPhysics,
    Enum.HumanoidStateType.Seated,
    Enum.HumanoidStateType.Climbing,
    Enum.HumanoidStateType.PlatformStanding,
    Enum.HumanoidStateType.FallingDown,
    Enum.HumanoidStateType.Freefall,
    Enum.HumanoidStateType.Swimming,
    Enum.HumanoidStateType.StrafingNoPhysics,
}

local JOINTS_BY_RIGTYPE = {
    [Enum.HumanoidRigType.R15] = {
        "RootJoint",
        "Waist",
        "Neck",
        "LeftShoulder",
        "RightShoulder",
        "LeftElbow",
        "RightElbow",
        "LeftWrist",
        "RightWrist",
        "LeftHip",
        "RightHip",
        "LeftKnee",
        "RightKnee",
        "LeftAnkle",
        "RightAnkle",
    },
    [Enum.HumanoidRigType.R6] = {
        "RootJoint",
        "Neck",
        "Left Shoulder",
        "Right Shoulder",
        "Left Hip",
        "Right Hip",
    },
}

local remoteEvent = ReplicatedStorage:FindFirstChild(REMOTE_NAME)
if not (remoteEvent and remoteEvent:IsA("RemoteEvent")) then
    if remoteEvent then
        remoteEvent:Destroy()
    end

    remoteEvent = Instance.new("RemoteEvent")
    remoteEvent.Name = REMOTE_NAME
    remoteEvent.Parent = ReplicatedStorage
end

local ragdollStates = {}
local playerCooldowns = {}

local function ensureCharacterState(character)
    local state = ragdollStates[character]
    if not state then
        state = {
            ragdolled = false,
            joints = {},
            disabledStates = {},
            autoRecoverId = 0,
        }
        ragdollStates[character] = state
    end

    return state
end

local function sendStateToClient(character, isRagdolled)
    local player = Players:GetPlayerFromCharacter(character)
    if player then
        remoteEvent:FireClient(player, isRagdolled)
    end
end

local function createConstraintForMotor(motor)
    if not motor or not motor:IsA("Motor6D") then
        return nil
    end

    local part0 = motor.Part0
    local part1 = motor.Part1
    if not part0 or not part1 then
        return nil
    end

    local attachment0 = Instance.new("Attachment")
    attachment0.Name = motor.Name .. "_RagdollAttachment0"
    attachment0.CFrame = motor.C0
    attachment0.Parent = part0

    local attachment1 = Instance.new("Attachment")
    attachment1.Name = motor.Name .. "_RagdollAttachment1"
    attachment1.CFrame = motor.C1
    attachment1.Parent = part1

    local constraint = Instance.new("BallSocketConstraint")
    constraint.Name = motor.Name .. "_RagdollConstraint"
    constraint.Attachment0 = attachment0
    constraint.Attachment1 = attachment1
    constraint.LimitsEnabled = true
    constraint.UpperAngle = 70
    constraint.TwistLimitsEnabled = true
    constraint.TwistLowerAngle = -45
    constraint.TwistUpperAngle = 45
    constraint.Parent = part0

    return {
        constraint = constraint,
        attachments = { attachment0, attachment1 },
    }
end

local function disableHumanoidStates(humanoid, stateRecord)
    for _, stateType in ipairs(STATES_TO_DISABLE) do
        if humanoid:GetStateEnabled(stateType) then
            humanoid:SetStateEnabled(stateType, false)
            stateRecord[stateType] = true
        end
    end
end

local function restoreHumanoidStates(humanoid, stateRecord)
    for stateType in pairs(stateRecord) do
        humanoid:SetStateEnabled(stateType, true)
    end
end

local function unragdollCharacter(character)
    local state = ragdollStates[character]
    if not state or not state.ragdolled then
        return false
    end

    state.autoRecoverId = state.autoRecoverId + 1

    for motor, info in pairs(state.joints) do
        if motor and motor.Parent and motor:IsA("Motor6D") then
            motor.Enabled = true
        end

        if info.constraint then
            info.constraint:Destroy()
        end

        for _, attachment in ipairs(info.attachments) do
            if attachment then
                attachment:Destroy()
            end
        end
    end

    state.joints = {}

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if humanoid then
        humanoid.PlatformStand = false
        restoreHumanoidStates(humanoid, state.disabledStates)
        state.disabledStates = {}
        if humanoid.Health > 0 then
            humanoid:ChangeState(Enum.HumanoidStateType.GettingUp)
            humanoid:ChangeState(Enum.HumanoidStateType.Running)
        end
    else
        state.disabledStates = {}
    end

    state.ragdolled = false
    return true
end

local function ragdollCharacter(character)
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return false
    end

    local state = ensureCharacterState(character)
    if state.ragdolled then
        return true
    end

    local joints = JOINTS_BY_RIGTYPE[humanoid.RigType] or JOINTS_BY_RIGTYPE[Enum.HumanoidRigType.R6]
    state.joints = {}
    state.disabledStates = {}

    for _, jointName in ipairs(joints) do
        local motor = character:FindFirstChild(jointName, true)
        if motor and motor:IsA("Motor6D") then
            local info = createConstraintForMotor(motor)
            if info then
                motor.Enabled = false
                state.joints[motor] = info
            end
        end
    end

    humanoid:ChangeState(Enum.HumanoidStateType.Physics)
    humanoid.PlatformStand = true
    disableHumanoidStates(humanoid, state.disabledStates)

    state.ragdolled = true
    state.autoRecoverId = state.autoRecoverId + 1
    local recoverToken = state.autoRecoverId

    task.delay(AUTO_RECOVER_SECONDS, function()
        if ragdollStates[character] ~= state then
            return
        end

        if state.ragdolled and state.autoRecoverId == recoverToken then
            if unragdollCharacter(character) then
                sendStateToClient(character, false)
            end
        end
    end)

    return true
end

local function clearCharacterState(character)
    local state = ragdollStates[character]
    if not state then
        return
    end

    if state.ragdolled then
        unragdollCharacter(character)
    end

    ragdollStates[character] = nil
end

local function trackCharacter(character)
    ensureCharacterState(character)
    sendStateToClient(character, false)

    task.spawn(function()
        local humanoid = character:WaitForChild("Humanoid", 5)
        if humanoid then
            humanoid.Died:Connect(function()
                clearCharacterState(character)
            end)
        end
    end)

    character.AncestryChanged:Connect(function(_, parent)
        if not parent then
            clearCharacterState(character)
        end
    end)
end

Players.PlayerAdded:Connect(function(player)
    playerCooldowns[player] = 0

    player.CharacterAdded:Connect(function(character)
        trackCharacter(character)
    end)

    player.CharacterRemoving:Connect(function(character)
        clearCharacterState(character)
    end)

    if player.Character then
        trackCharacter(player.Character)
    end
end)

Players.PlayerRemoving:Connect(function(player)
    playerCooldowns[player] = nil
    local character = player.Character
    if character then
        clearCharacterState(character)
    end
end)

remoteEvent.OnServerEvent:Connect(function(player)
    if typeof(player) ~= "Instance" or not player:IsA("Player") then
        return
    end

    local now = os.clock()
    local last = playerCooldowns[player]
    if last and now - last < SERVER_DEBOUNCE then
        return
    end

    playerCooldowns[player] = now

    local character = player.Character
    if not character or not character.Parent then
        return
    end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then
        return
    end

    local state = ensureCharacterState(character)

    if state.ragdolled then
        if unragdollCharacter(character) then
            sendStateToClient(character, false)
        end
    else
        if ragdollCharacter(character) then
            sendStateToClient(character, true)
        end
    end
end)
