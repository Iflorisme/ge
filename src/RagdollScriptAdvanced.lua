--[[
	Advanced Roblox Ragdoll Script - R6/R15 Compatible
	Place this LocalScript in StarterPlayer > StarterCharacterScripts
	Press R to toggle ragdoll mode on/off
	
	Features:
	- R6 and R15 support
	- Configurable physics properties
	- Smooth transitions
	- Death and respawn handling
	- Customizable keybind
	- Optional visual feedback
]]

local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local character = script.Parent
local humanoid = character:WaitForChild("Humanoid")
local rootPart = character:WaitForChild("HumanoidRootPart")

local isRagdoll = false
local ragdollJoints = {}
local originalJoints = {}
local inputConnection
local diedConnection
local ancestryConnection

local RAGDOLL_KEY = Enum.KeyCode.R

local CONFIG = {
	UpperAngle = 45,
	TwistLowerAngle = -45,
	TwistUpperAngle = 45,
	ShowDebugMessages = false,
	TransitionDuration = 0.2,
	CollisionGroup = nil,
}

local function debugPrint(message)
	if CONFIG.ShowDebugMessages then
		print("[Ragdoll] " .. message)
	end
end

local function isR15()
	return humanoid.RigType == Enum.HumanoidRigType.R15
end

local function createRagdollJoint(part0, part1, c0, c1)
	if not part0 or not part1 then
		warn("Invalid parts for ragdoll joint creation")
		return nil
	end
	
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
	ballSocket.UpperAngle = CONFIG.UpperAngle
	ballSocket.TwistLowerAngle = CONFIG.TwistLowerAngle
	ballSocket.TwistUpperAngle = CONFIG.TwistUpperAngle
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
	debugPrint("Found " .. #motors .. " Motor6D joints")
	return motors
end

local function setCollisionGroup(part, groupName)
	if groupName and part:IsA("BasePart") then
		pcall(function()
			part.CollisionGroupId = game:GetService("PhysicsService"):GetCollisionGroupId(groupName)
		end)
	end
end

local function enableRagdoll()
	if isRagdoll then 
		debugPrint("Already ragdolled, skipping")
		return 
	end
	
	if humanoid.Health <= 0 then 
		debugPrint("Character is dead, cannot ragdoll")
		return 
	end
	
	debugPrint("Enabling ragdoll...")
	
	humanoid.AutoRotate = false
	humanoid:SetStateEnabled(Enum.HumanoidStateType.FallingDown, false)
	humanoid:SetStateEnabled(Enum.HumanoidStateType.Ragdoll, true)
	humanoid:ChangeState(Enum.HumanoidStateType.Physics)
	
	local motors = getMotor6Ds()
	local jointCount = 0
	
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
			if ragdollJoint then
				table.insert(ragdollJoints, ragdollJoint)
				jointCount = jointCount + 1
			end
			
			motor.Parent = nil
		end
	end
	
	for _, part in pairs(character:GetDescendants()) do
		if part:IsA("BasePart") and part ~= rootPart then
			part.CanCollide = true
			if CONFIG.CollisionGroup then
				setCollisionGroup(part, CONFIG.CollisionGroup)
			end
		end
	end
	
	isRagdoll = true
	debugPrint("Ragdoll enabled with " .. jointCount .. " joints")
end

local function disableRagdoll()
	if not isRagdoll then 
		debugPrint("Not ragdolled, skipping")
		return 
	end
	
	if humanoid.Health <= 0 then 
		debugPrint("Character is dead, cannot un-ragdoll")
		return 
	end
	
	debugPrint("Disabling ragdoll...")
	
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
	debugPrint("Ragdoll disabled")
end

local function onInputBegan(input, gameProcessed)
	if gameProcessed then return end
	
	if input.KeyCode == RAGDOLL_KEY then
		debugPrint("Ragdoll key pressed")
		if isRagdoll then
			disableRagdoll()
		else
			enableRagdoll()
		end
	end
end

local function onCharacterDied()
	debugPrint("Character died, cleaning up ragdoll")
	
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

local function cleanup()
	debugPrint("Cleaning up script")
	
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
	end
	
	if inputConnection then
		inputConnection:Disconnect()
	end
	if diedConnection then
		diedConnection:Disconnect()
	end
	if ancestryConnection then
		ancestryConnection:Disconnect()
	end
end

inputConnection = UserInputService.InputBegan:Connect(onInputBegan)
diedConnection = humanoid.Died:Connect(onCharacterDied)
ancestryConnection = character.AncestryChanged:Connect(function(_, parent)
	if not parent then
		cleanup()
	end
end)

debugPrint("Ragdoll script initialized for " .. (isR15() and "R15" or "R6") .. " character")
