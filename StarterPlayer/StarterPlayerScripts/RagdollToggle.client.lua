local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local remoteEvent = ReplicatedStorage:WaitForChild("RagdollToggleEvent")

local DEBOUNCE_SECONDS = 0.3
local lastToggleTime = 0
local currentRagdollState = false

remoteEvent.OnClientEvent:Connect(function(isRagdolled)
	currentRagdollState = isRagdolled and true or false
end)

player.CharacterAdded:Connect(function()
	currentRagdollState = false
end)

UserInputService.InputBegan:Connect(function(input, gameProcessedEvent)
	if gameProcessedEvent then
		return
	end

	if input.KeyCode ~= Enum.KeyCode.R then
		return
	end

	local now = os.clock()
	if now - lastToggleTime < DEBOUNCE_SECONDS then
		return
	end

	lastToggleTime = now
	remoteEvent:FireServer(currentRagdollState)
end)
