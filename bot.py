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
        
        await self.start_gen_process()
        
    def clear_console(self):
        os.system('clear' if os.name != 'nt' else 'cls')
        
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
            command = f"/pgen stock:{stock}"
            await channel.send(command)
        except Exception as e:
            print(f"❌ Failed to send command: {e}")
            
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
