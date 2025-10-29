import os
import logging
from dotenv import load_dotenv
import discord

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('discord_selfbot')


class SelfBot(discord.Client):
    def __init__(self):
        super().__init__()
        self.user_id = None
        
    async def on_ready(self):
        self.user_id = self.user.id
        logger.info(f'Self-bot logged in as {self.user.name} (ID: {self.user.id})')
        logger.info('Bot is ready to respond to !ping commands')
        
    async def on_message(self, message):
        try:
            if message.author.id != self.user_id:
                return
                
            if message.content.strip() == '!ping':
                logger.info(f'Ping command detected in channel: {message.channel}')
                await message.channel.send('pong')
                logger.info('Responded with pong')
                
        except discord.errors.Forbidden:
            logger.error(f'Missing permissions to send message in channel: {message.channel}')
        except discord.errors.HTTPException as e:
            logger.error(f'HTTP error occurred: {e}')
        except Exception as e:
            logger.error(f'Unexpected error: {e}')


def main():
    token = os.getenv('DISCORD_TOKEN')
    
    if not token:
        logger.error('DISCORD_TOKEN not found in environment variables')
        logger.error('Please create a .env file with your Discord token')
        return
        
    try:
        client = SelfBot()
        logger.info('Starting self-bot...')
        client.run(token)
    except discord.errors.LoginFailure:
        logger.error('Failed to login. Please check your token.')
    except Exception as e:
        logger.error(f'Failed to start bot: {e}')


if __name__ == '__main__':
    main()
