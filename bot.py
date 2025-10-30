import os
import asyncio
import aiohttp
import requests
import base64
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv
import discord

load_dotenv()

CHANNEL_ID = 1422966181966516458
BOT_ID = 1312131736691277914
MAX_GENS = 5
COOLDOWN = 3
POLLINATIONS_API = "https://text.pollinations.ai/"


class GenBot(discord.Client):
    def __init__(self):
        super().__init__()
        self.user_id = None
        self.gen_count = 0
        self.waiting_for_response = False
        self.waiting_for_captcha = False
        self.current_stock = None
        self.target_gens = 0
        self.generated_accounts = []
        self.pgen_command_id = None
        
    async def on_ready(self):
        self.user_id = self.user.id
        self.clear_console()
        print("=" * 60)
        print("  DISCORD ACCOUNT GENERATOR BOT")
        print("=" * 60)
        print(f"✓ Logged in as: {self.user.name}")
        print(f"✓ User ID: {self.user.id}")
        print(f"✓ Target Channel: {CHANNEL_ID}")
        print(f"✓ Bot ID: {BOT_ID}")
        print("=" * 60)
        print()
        
        print("🔍 Fetching command information...")
        await self.fetch_command_id()
        
        await self.start_gen_process()
        
    def clear_console(self):
        os.system('clear' if os.name != 'nt' else 'cls')
    
    async def fetch_command_id(self):
        try:
            channel = self.get_channel(CHANNEL_ID)
            if not channel:
                print("⚠️  Could not fetch command ID: Channel not found")
                return
                
            guild_id = channel.guild.id if hasattr(channel, 'guild') else None
            if not guild_id:
                print("⚠️  Could not fetch command ID: Not in a guild")
                return
            
            headers = {
                "Authorization": self.http.token
            }
            
            async with aiohttp.ClientSession() as session:
                url = f"https://discord.com/api/v9/guilds/{guild_id}/application-commands/search?type=1&include_applications=true"
                
                async with session.get(url, headers=headers) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        commands = data.get('application_commands', [])
                        
                        print(f"📋 Found {len(commands)} commands in guild")
                        
                        for cmd in commands:
                            cmd_name = cmd.get('name', '')
                            cmd_app_id = cmd.get('application_id', '')
                            
                            if cmd_name == 'pgen' and str(cmd_app_id) == str(BOT_ID):
                                self.pgen_command_id = cmd.get('id')
                                cmd_version = cmd.get('version', 'unknown')
                                print(f"✓ Found /pgen command!")
                                print(f"  ID: {self.pgen_command_id}")
                                print(f"  Version: {cmd_version}")
                                print(f"  Application: {cmd_app_id}")
                                return
                        
                        print("⚠️  /pgen command not found in guild commands")
                        print("    Trying alternative method...")
                        
                        url2 = f"https://discord.com/api/v9/applications/{BOT_ID}/commands"
                        async with session.get(url2, headers=headers) as resp2:
                            if resp2.status == 200:
                                data2 = await resp2.json()
                                for cmd in data2:
                                    if cmd.get('name') == 'pgen':
                                        self.pgen_command_id = cmd.get('id')
                                        print(f"✓ Found /pgen command via alternative method!")
                                        print(f"  ID: {self.pgen_command_id}")
                                        return
                        
                        print("⚠️  Could not find /pgen command")
                    else:
                        error_text = await resp.text()
                        print(f"⚠️  Could not fetch commands: Status {resp.status}")
                        print(f"    Response: {error_text[:200]}")
                        
        except Exception as e:
            print(f"⚠️  Error fetching command ID: {e}")
            import traceback
            traceback.print_exc()
        
    async def start_gen_process(self):
        while True:
            try:
                self.clear_console()
                print("=" * 60)
                print("  ACCOUNT GENERATOR")
                print("=" * 60)
                print()
                
                stock = await self.get_input("Select Stock to gen: ")
                if not stock:
                    print("Invalid stock name!")
                    await asyncio.sleep(2)
                    continue
                    
                amount_str = await self.get_input("How much to gen: ")
                try:
                    amount = int(amount_str)
                    if amount <= 0:
                        print("Amount must be positive!")
                        await asyncio.sleep(2)
                        continue
                except ValueError:
                    print("Invalid amount!")
                    await asyncio.sleep(2)
                    continue
                
                self.current_stock = stock
                self.target_gens = amount
                self.gen_count = 0
                self.generated_accounts = []
                
                await self.run_gen_process()
                
            except Exception as e:
                print(f"Error in gen process: {e}")
                await asyncio.sleep(3)
    
    async def get_input(self, prompt):
        print(prompt, end='', flush=True)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, input)
    
    async def run_gen_process(self):
        self.clear_console()
        print("=" * 60)
        print("  GENERATION IN PROGRESS")
        print("=" * 60)
        print(f"Stock: {self.current_stock}")
        print(f"Target: {self.target_gens} accounts")
        print("=" * 60)
        print()
        
        channel = self.get_channel(CHANNEL_ID)
        if not channel:
            print("❌ Channel not found!")
            await asyncio.sleep(3)
            return
            
        for i in range(self.target_gens):
            if self.gen_count >= MAX_GENS:
                print()
                print("⚠️  Reached maximum generation limit (5)")
                print("⏳ Waiting for CAPTCHA...")
                self.waiting_for_captcha = True
                
                while self.waiting_for_captcha:
                    await asyncio.sleep(1)
                
                self.gen_count = 0
                
            self.update_progress_ui(i + 1)
            
            try:
                await self.send_slash_command(channel, self.current_stock)
                self.waiting_for_response = True
                
                timeout = 30
                elapsed = 0
                while self.waiting_for_response and elapsed < timeout:
                    await asyncio.sleep(0.5)
                    elapsed += 0.5
                
                if self.waiting_for_response:
                    print(f"⚠️  Timeout waiting for response for gen #{i + 1}")
                    self.waiting_for_response = False
                
                if i + 1 < self.target_gens:
                    print(f"⏳ Cooldown {COOLDOWN}s...", end='', flush=True)
                    await asyncio.sleep(COOLDOWN)
                    print(" Done!")
                    
            except Exception as e:
                print(f"❌ Error generating account #{i + 1}: {e}")
                await asyncio.sleep(2)
        
        print()
        print("=" * 60)
        print("  GENERATION COMPLETE")
        print("=" * 60)
        print(f"✓ Successfully generated: {len(self.generated_accounts)} accounts")
        print()
        print("Generated Accounts:")
        for idx, acc in enumerate(self.generated_accounts, 1):
            print(f"  {idx}. {acc['username']}:{acc['password']}")
        print("=" * 60)
        print()
        input("Press Enter to start a new generation...")
    
    def update_progress_ui(self, current):
        progress = int((current / self.target_gens) * 50)
        bar = "█" * progress + "░" * (50 - progress)
        percentage = int((current / self.target_gens) * 100)
        
        print(f"\r[{bar}] {percentage}% ({current}/{self.target_gens})", end='', flush=True)
        
    async def send_slash_command(self, channel, stock):
        try:
            if not self.pgen_command_id:
                print(f"\n⚠️  Command ID not found! Attempting manual trigger...")
                await channel.send(f"/pgen stock:{stock}")
                print(f"    Sent as text, you may need to manually run: /pgen stock:{stock}")
                return
            
            guild_id = channel.guild.id if hasattr(channel, 'guild') else None
            
            url = f"https://discord.com/api/v9/interactions"
            
            headers = {
                "Authorization": self.http.token,
                "Content-Type": "application/json"
            }
            
            nonce = str(int(datetime.now().timestamp() * 1000))
            session_id = self.ws.session_id if hasattr(self, 'ws') and hasattr(self.ws, 'session_id') else None
            
            payload = {
                "type": 2,
                "application_id": str(BOT_ID),
                "guild_id": str(guild_id) if guild_id else None,
                "channel_id": str(channel.id),
                "session_id": session_id,
                "data": {
                    "version": "1",
                    "id": str(self.pgen_command_id),
                    "name": "pgen",
                    "type": 1,
                    "options": [
                        {
                            "type": 3,
                            "name": "stock",
                            "value": stock
                        }
                    ],
                    "application_command": {
                        "id": str(self.pgen_command_id),
                        "type": 1,
                        "application_id": str(BOT_ID),
                        "version": "1",
                        "name": "pgen",
                        "description": "Generate account",
                        "options": [
                            {
                                "type": 3,
                                "name": "stock",
                                "description": "Stock to generate",
                                "required": True
                            }
                        ]
                    },
                    "attachments": []
                },
                "nonce": nonce
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as resp:
                    if resp.status in [200, 201, 204]:
                        pass
                    else:
                        error_text = await resp.text()
                        print(f"\n⚠️  Slash command failed (Status {resp.status})")
                        print(f"    Error: {error_text[:200]}")
                        if resp.status == 400:
                            print(f"    The command might not be available or parameters are wrong")
                            print(f"    Trying fallback method...")
                            await channel.send(f"/pgen stock:{stock}")
                        
        except Exception as e:
            print(f"\n❌ Failed to send slash command: {e}")
            import traceback
            traceback.print_exc()
            
    async def on_message(self, message):
        try:
            if message.author.id == BOT_ID and message.channel.id == CHANNEL_ID:
                await self.handle_bot_response(message)
            
            if isinstance(message.channel, discord.DMChannel) and message.author.id == BOT_ID:
                await self.handle_dm(message)
                
        except Exception as e:
            print(f"Error handling message: {e}")
    
    async def handle_bot_response(self, message):
        if not message.embeds:
            return
            
        embed = message.embeds[0]
        
        if "Generated" in embed.description or "Check your DMs" in embed.description:
            self.gen_count += 1
            print(f"\n✓ Gen #{self.gen_count} successful!")
            self.waiting_for_response = False
            
        elif "CAPTCHA Required" in (embed.title or ""):
            print("\n⚠️  CAPTCHA detected!")
            await self.handle_captcha(message)
            
    async def handle_dm(self, message):
        if not message.embeds:
            return
            
        embed = message.embeds[0]
        description = embed.description or ""
        
        if "Username:" in description and "Password:" in description:
            lines = description.split('\n')
            username = ""
            password = ""
            
            for i, line in enumerate(lines):
                if "Username:" in line and i + 1 < len(lines):
                    username = lines[i + 1].strip()
                elif "Password:" in line and i + 1 < len(lines):
                    password = lines[i + 1].strip()
            
            if username and password:
                self.generated_accounts.append({
                    'username': username,
                    'password': password
                })
                print(f"\n📧 Received credentials: {username}")
    
    async def handle_captcha(self, message):
        try:
            embed = message.embeds[0]
            captcha_image_url = None
            
            if embed.image:
                captcha_image_url = embed.image.url
            elif embed.thumbnail:
                captcha_image_url = embed.thumbnail.url
                
            if not captcha_image_url:
                print("❌ Could not find CAPTCHA image")
                self.waiting_for_captcha = False
                return
            
            print("🤖 Solving CAPTCHA with AI...")
            
            captcha_code = await self.solve_captcha_with_ai(captcha_image_url)
            
            if not captcha_code:
                print("❌ Failed to solve CAPTCHA")
                self.waiting_for_captcha = False
                return
            
            print(f"✓ CAPTCHA solved: {captcha_code}")
            
            components = message.components
            if not components:
                print("❌ No button found in CAPTCHA message")
                self.waiting_for_captcha = False
                return
            
            button = None
            for action_row in components:
                for component in action_row.children:
                    if "verify" in component.label.lower():
                        button = component
                        break
                if button:
                    break
            
            if not button:
                print("❌ Verify button not found")
                self.waiting_for_captcha = False
                return
            
            print("📝 Submitting CAPTCHA...")
            
            await asyncio.sleep(1)
            
            await button.click()
            
            await asyncio.sleep(2)
            
            modal_data = {
                "custom_id": button.custom_id,
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 4,
                                "custom_id": "captcha_code",
                                "value": captcha_code
                            }
                        ]
                    }
                ]
            }
            
            try:
                await self.http.request(
                    discord.http.Route('POST', f'/interactions/{message.id}/callback'),
                    json={
                        "type": 5,
                        "data": modal_data
                    }
                )
            except:
                pass
            
            print("✓ CAPTCHA submitted successfully!")
            await asyncio.sleep(2)
            self.waiting_for_captcha = False
            
        except Exception as e:
            print(f"❌ Error handling CAPTCHA: {e}")
            self.waiting_for_captcha = False
    
    async def solve_captcha_with_ai(self, image_url):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as resp:
                    if resp.status != 200:
                        return None
                    image_data = await resp.read()
            
            img_base64 = base64.b64encode(image_data).decode('utf-8')
            
            prompt = "Look at this CAPTCHA image and respond ONLY with the exact code you see. Do not include any other text, explanation, or formatting. Just the code characters."
            
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{img_base64}"
                                }
                            }
                        ]
                    }
                ],
                "model": "openai",
                "seed": 42
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(POLLINATIONS_API, json=payload) as resp:
                    if resp.status == 200:
                        result = await resp.text()
                        code = result.strip().upper()
                        code = ''.join(c for c in code if c.isalnum())
                        return code
            
            return None
            
        except Exception as e:
            print(f"Error solving CAPTCHA: {e}")
            return None


def main():
    token = os.getenv('token')
    
    if not token:
        print("=" * 60)
        print("ERROR: Token not found!")
        print("=" * 60)
        print()
        print("Please set the 'token' environment variable in Replit:")
        print("1. Click on 'Secrets' in the left sidebar")
        print("2. Add a new secret:")
        print("   Key: token")
        print("   Value: your_discord_user_token")
        print()
        print("=" * 60)
        return
        
    try:
        client = GenBot()
        print("Starting bot...")
        client.run(token)
    except discord.errors.LoginFailure:
        print("❌ Failed to login. Please check your token.")
    except Exception as e:
        print(f"❌ Failed to start bot: {e}")


if __name__ == '__main__':
    main()
