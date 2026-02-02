# 🚀 Chatbot Quick Start Guide

## ⚡ 30-Second Setup

### 1. Get API Key
```
Go to: https://console.anthropic.com/
→ Create account → Get API key
```

### 2. Set Environment Variable
```bash
# In LuxuryStay/Back-End/.env
ANTHROPIC_API_KEY=your_key_here
```

### 3. Start Servers
```bash
# Terminal 1: Backend
cd LuxuryStay/Back-End
npm run dev

# Terminal 2: Frontend
cd LuxuryStay/Front-End
npm run dev
```

### 4. Test
Open http://localhost:5173 → Click 💬 button → Type a question

---

## 📁 File Quick Reference

| File | Purpose |
|------|---------|
| `Controller/ChatbotController.mjs` | AI logic & API calls |
| `Routers/chatbotRoutes.mjs` | API endpoint routing |
| `components/ChatbotWidget.jsx` | Chat UI component |
| `components/ChatbotWidget.css` | Widget styling |

---

## 🔧 Quick Customizations

### Change Bot Greeting
**File**: `components/ChatbotWidget.jsx` (line 21)
```javascript
text: "👋 Hello! I'm your LuxuryStay AI Assistant...",
```

### Change Bot Behavior
**File**: `Controller/ChatbotController.mjs` (line 6)
```javascript
const SYSTEM_PROMPT = `You are a professional hotel virtual assistant...`
```

### Change Widget Color
**File**: `components/ChatbotWidget.css` (line 13)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change API Endpoint
**File**: `components/ChatbotWidget.jsx` (line 63)
```javascript
const response = await fetch('http://localhost:3000/api/chatbot/chat', {
```

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Widget not showing | Check `App.jsx` imports `ChatbotWidget` |
| API returns error | Verify `ANTHROPIC_API_KEY` in `.env` |
| Slow responses | Check API rate limits (5/min free tier) |
| CORS error | Update `origin` in `app.mjs` |
| Can't connect to backend | Ensure backend runs on port 3000 |

---

## ✅ Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads without console errors
- [ ] Chatbot widget appears in bottom-right
- [ ] Can open/close chat widget
- [ ] Can type and send messages
- [ ] AI responds within 5 seconds
- [ ] Bot handles hotel-related questions
- [ ] Error messages display gracefully

---

## 🎯 Next Steps

1. **Deploy Backend** → Set `ANTHROPIC_API_KEY` on hosting platform
2. **Deploy Frontend** → Update API endpoint URL for production
3. **Add Analytics** → Log messages to MongoDB
4. **Customize Behavior** → Update system prompt for your hotel
5. **Add Rate Limiting** → Prevent API abuse

---

## 📞 Support

If something breaks:
1. Check console errors (F12)
2. Verify environment variables
3. Ensure both servers running on correct ports
4. Check CORS configuration
5. Review `CHATBOT_SETUP.md` for detailed troubleshooting

Happy coding! 🎉
