--[[
    Roblox Ragdoll Script - R6/R15 Compatible
    Place this LocalScript in StarterPlayer > StarterCharacterScripts
    Press R to toggle ragdoll mode on/off
]]

local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local character = script.Parent
local humanoid = character:WaitForChild("Humanoid")
local rootPart = character:WaitForChild("HumanoidRootPart")

local isRagdoll = false
local ragdollJoints = {}
local originalJoints = {}

local RAGDOLL_KEY = Enum.KeyCode.R

local function isR15()
    return humanoid.RigType == Enum.HumanoidRigType.R15
end

local function createRagdollJoint(part0, part1, c0, c1)
    local attachment0 = Instance.new("Attachment")
    attachment0.Name = "RagdollAttachment0"
    attachment0.CFrame = c0
    attachment0.Parent = part0
    
    local attachment1 = Instance.new("Attachment")
    attachment1.Name = "RagdollAttachment1"
    attachment1.CFrame = c1
    attachment1.Parent = part1
    
    local ballSocket = Instance.new("BallSocketConstraint")
    ballSocket.Name = "RagdollConstraint"
    ballSocket.Attachment0 = attachment0
    ballSocket.Attachment1 = attachment1
    ballSocket.LimitsEnabled = true
    ballSocket.TwistLimitsEnabled = true
    ballSocket.UpperAngle = 45
    ballSocket.TwistLowerAngle = -45
    ballSocket.TwistUpperAngle = 45
    ballSocket.Parent = part0
    
    return {
        Attachment0 = attachment0,
        Attachment1 = attachment1,
        Constraint = ballSocket
    }
end

local function getMotor6Ds()
    local motors = {}
    for _, descendant in pairs(character:GetDescendants()) do
        if descendant:IsA("Motor6D") then
            table.insert(motors, descendant)
        end
    end
    return motors
end

local function enableRagdoll()
    if isRagdoll then return end
    if humanoid.Health <= 0 then return end
    
    humanoid.AutoRotate = false
    humanoid:SetStateEnabled(Enum.HumanoidStateType.FallingDown, false)
    humanoid:SetStateEnabled(Enum.HumanoidStateType.Ragdoll, true)
    humanoid:ChangeState(Enum.HumanoidStateType.Physics)
    
    local motors = getMotor6Ds()
    
    for _, motor in pairs(motors) do
        if motor.Name ~= "Root" and motor.Part1 and motor.Part0 then
            local jointData = {
                Motor = motor,
                Part0 = motor.Part0,
                Part1 = motor.Part1,
                C0 = motor.C0,
                C1 = motor.C1,
                Parent = motor.Parent
            }
            table.insert(originalJoints, jointData)
            
            local ragdollJoint = createRagdollJoint(motor.Part0, motor.Part1, motor.C0, motor.C1)
            table.insert(ragdollJoints, ragdollJoint)
            
            motor.Parent = nil
        end
    end
    
    for _, part in pairs(character:GetDescendants()) do
        if part:IsA("BasePart") and part ~= rootPart then
            part.CanCollide = true
        end
    end
    
    isRagdoll = true
end

local function disableRagdoll()
    if not isRagdoll then return end
    if humanoid.Health <= 0 then return end
    
    for _, ragdollJoint in pairs(ragdollJoints) do
        if ragdollJoint.Attachment0 then
            ragdollJoint.Attachment0:Destroy()
        end
        if ragdollJoint.Attachment1 then
            ragdollJoint.Attachment1:Destroy()
        end
        if ragdollJoint.Constraint then
            ragdollJoint.Constraint:Destroy()
        end
    end
    ragdollJoints = {}
    
    for _, jointData in pairs(originalJoints) do
        if jointData.Motor and jointData.Part0 and jointData.Part1 then
            jointData.Motor.Part0 = jointData.Part0
            jointData.Motor.Part1 = jointData.Part1
            jointData.Motor.C0 = jointData.C0
            jointData.Motor.C1 = jointData.C1
            jointData.Motor.Parent = jointData.Parent
        end
    end
    originalJoints = {}
    
    for _, part in pairs(character:GetDescendants()) do
        if part:IsA("BasePart") and part.Name ~= "Head" and part ~= rootPart then
            part.CanCollide = false
        end
    end
    
    humanoid:SetStateEnabled(Enum.HumanoidStateType.FallingDown, true)
    humanoid:SetStateEnabled(Enum.HumanoidStateType.Ragdoll, true)
    humanoid:ChangeState(Enum.HumanoidStateType.GettingUp)
    humanoid.AutoRotate = true
    
    isRagdoll = false
end

local function onInputBegan(input, gameProcessed)
    if gameProcessed then return end
    
    if input.KeyCode == RAGDOLL_KEY then
        if isRagdoll then
            disableRagdoll()
        else
            enableRagdoll()
        end
    end
end

local function onCharacterDied()
    if isRagdoll then
        for _, ragdollJoint in pairs(ragdollJoints) do
            if ragdollJoint.Attachment0 then
                ragdollJoint.Attachment0:Destroy()
            end
            if ragdollJoint.Attachment1 then
                ragdollJoint.Attachment1:Destroy()
            end
            if ragdollJoint.Constraint then
                ragdollJoint.Constraint:Destroy()
            end
        end
        ragdollJoints = {}
        originalJoints = {}
        isRagdoll = false
    end
end

UserInputService.InputBegan:Connect(onInputBegan)
humanoid.Died:Connect(onCharacterDied)

local function cleanup()
    if isRagdoll then
        disableRagdoll()
    end
end

character.AncestryChanged:Connect(function(_, parent)
    if not parent then
        cleanup()
    end
end)
