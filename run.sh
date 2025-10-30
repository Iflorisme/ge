#!/bin/bash

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "Starting Discord Account Generator Bot..."
echo ""
python3 bot.py
