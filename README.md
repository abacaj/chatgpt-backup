# Backup your ChatGPT conversations

A single client side script to backup your entire conversation history on [chat.openai.com](https://chat.openai.com). The output is a single JSON file of your history.

> **🔓 Open Source Project**: This project is, was, and will always be completely open source and free for everyone. Built by the community, for the community.

## 🎯 Choose Your Backup Method

### Option A: Specific Conversation (Recommended)
**For backing up individual conversations or custom GPTs**
- Use `backup_conversa_atual.js` 
- ⚡ **Fast**: Takes seconds
- 🎯 **Targeted**: Only current conversation
- 💾 **Lightweight**: Small file size

### Option B: Complete Backup
**For backing up all your ChatGPT history**
- Use `backup.js`
- 🕐 **Comprehensive**: All conversations
- ⏳ **Time-intensive**: Can take hours
- 📦 **Large**: Full history file

## 🚀 Preview your backups with the improved viewer

**We've completely rebuilt the viewer with vanilla JavaScript for better reliability:**

1. Open `index.html` in your browser (or serve locally)
2. Load your JSON backup file
3. Browse conversations with enhanced interface
4. Export individual conversations to Markdown

![Preview](assets/preview.png)

### ✨ New Viewer Features
- **🔄 Robust loading**: No external dependencies 
- **📱 Responsive design**: Works on any screen size
- **💾 Auto-save**: Remembers your loaded data
- **📄 Individual export**: Download conversations as Markdown
- **🎨 Clean interface**: Improved user experience
- **🛡️ Error handling**: Clear feedback and validation

## 📖 How to use

### For Specific Conversation Backup

1. Visit the ChatGPT conversation you want to backup
2. Open browser console (F12 on keyboard)  
3. Click on "Console" tab
4. Copy the entire content from `backup_conversa_atual.js` and paste into console
5. Press Enter and wait for automatic download

### For Complete Backup

1. Visit https://chat.openai.com
2. Make sure you are logged in
3. Open chrome console or firefox console (F12 on keyboard)
4. Click on "Console" tab
5. Copy the entire script content found in file `backup.js` and paste into the console input field at the bottom
6. Press enter, script starts and will log progress to console
   ![Progress](assets/progress.png)
7. If it fails at any point you can check the console logs to see the offset it failed at
8. You can run from any offset by adjusting the script offsets found at the bottom of the script:

```

## 🔧 How it works

This uses the same frontend API that is used by your client browser.

## ✨ Benefits

Some of the key benefits:

- **Nothing to download or install**
- **Tested on chrome, firefox**
- **Fully client side**, single script, copy paste to run
- **Respects rate limits**
- **Fails early** with clear error messages
- **Adjust offsets** if you have many conversations, ex. start at 0 to 500, then run 500 to 1000
- **Fully auditable code** in the backup files, no third parties
- **New: Enhanced viewer** with vanilla JavaScript for better reliability
- **New: Specific conversation backup** for targeted exports

## 📊 Scripts Comparison

| Feature | `backup.js` | `backup_conversa_atual.js` |
|---------|-------------|----------------------------|
| **Scope** | All conversations | Current conversation only |
| **Speed** | Hours (large datasets) | Seconds |
| **File size** | Large | Small |
| **Rate limiting** | Required | Not relevant |
| **Use case** | Complete archive | Specific backup |

## 🎯 Use cases

- **Backup your conversation history offline**
- **Archive specific important conversations**
- **Export custom GPT conversations**
- **The model output from the current OAI terms state that they belong to you**
- **Useful if you need to look back when the service is down**
- **Intended as a read-only backup** (the ids aren't stored)

## 📝 Notes

- **Tested with 700+ conversations**
- **Current rate is 60 conversations/minute** (for complete backup)
- **Roughly 10 minutes for 600 conversations**
- **Roughly 1 hour for 6000 conversations**
- **This is to respect the OAI API rate limits**
- **Keep your browser tab open**, you don't need it to be focused for this to finish
- **Chrome may prompt you to download the file** once it's completed
- **Tested on firefox**, requires you to type `allow pasting` before you can paste the script

## 🌟 Contributors

- [@abacaj](https://github.com/abacaj) - Original creator
- [@FredySandoval](https://github.com/FredySandoval) - Preview backups feature
- **Enhanced viewer and specific conversation backup** - Community contributionsjs
const START_OFFSET = 0;
const STOP_OFFSET = -1;
