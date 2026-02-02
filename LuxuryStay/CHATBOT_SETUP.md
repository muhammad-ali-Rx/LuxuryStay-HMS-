# 🤖 Hotel AI Chatbot Implementation Guide

## Overview

The LuxuryStay Hotel Management System now includes an AI-powered chatbot assistant that helps guests with hotel-related inquiries. The chatbot uses **Anthropic's Claude API** to provide intelligent, context-aware responses about:

- Room information and features
- Pricing and booking guidance
- Hotel services and amenities
- Check-in/check-out procedures
- Restaurant and dining information
- General hotel inquiries

---

## Architecture

### Tech Stack

- **Backend**: Express.js (Node.js) with ES Modules
- **Frontend**: React with JSX
- **AI API**: Anthropic Claude 3.5 Sonnet
- **Database**: MongoDB (for future message logging if needed)

### File Structure

```
LuxuryStay/
├── Back-End/
│   ├── Controller/
│   │   └── ChatbotController.mjs    🤖 Handles chatbot logic
│   ├── Routers/
│   │   └── chatbotRoutes.mjs        📡 API endpoint routes
│   └── app.mjs                       (Updated with chatbot route)
│
└── Front-End/
    └── src/
        ├── components/
        │   ├── ChatbotWidget.jsx     💬 Floating chat widget
        │   └── ChatbotWidget.css     🎨 Widget styling
        └── App.jsx                    (Integrated chatbot)
```

---

## Setup Instructions

### 1. Environment Variable Setup

#### Backend (.env file in LuxuryStay/Back-End/)

Add the following environment variable:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**How to get your Anthropic API key:**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

⚠️ **Important**: Never commit your API key to version control. Add `.env` to `.gitignore`.

### 2. Backend Setup

The backend is already integrated. Just ensure your environment variable is set:

```bash
cd LuxuryStay/Back-End
npm install  # If not already installed
npm run dev  # Start the backend server
```

The chatbot API will be available at: `http://localhost:3000/api/chatbot/chat`

### 3. Frontend Setup

The frontend component is already integrated into the App. Just start your frontend:

```bash
cd LuxuryStay/Front-End
npm install  # If not already installed
npm run dev  # Start the frontend development server
```

The chatbot widget will automatically appear in the bottom-right corner of all pages.

---

## API Documentation

### Endpoint: POST /api/chatbot/chat

**Description**: Sends a user message to the AI chatbot and receives a response.

**Request Body**:
```json
{
  "message": "What are your room options?"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "reply": "We offer various room types including standard, deluxe, and suite rooms with prices ranging from $100-$500 per night. Each room includes modern amenities and complimentary Wi-Fi.",
  "fallback": false
}
```

**Error Handling**:
- If the Anthropic API is unavailable, the system automatically returns a fallback response
- All errors are gracefully handled with user-friendly messages
- Check console logs for debugging information

---

## Features

### Frontend Widget Features

✅ **Floating Chat Interface**
- Positioned at bottom-right of the screen
- Toggle button to open/close chat
- Smooth animations and transitions

✅ **Chat Management**
- Display chat history during the conversation
- Auto-scroll to latest messages
- Loading indicator while waiting for response
- Professional message bubbles (user vs bot)

✅ **User Experience**
- Clean, modern design with gradient colors
- Responsive on all screen sizes
- Keyboard-accessible (proper ARIA labels)
- Light/dark mode support in CSS

✅ **Error Handling**
- Graceful fallback if API fails
- User-friendly error messages
- Network error handling

### Backend Features

✅ **Intelligent Responses**
- Uses Claude 3.5 Sonnet model
- System prompt tailored to hotel concierge behavior
- Keeps responses concise (max 300 tokens)
- Context-aware responses about hotel services

✅ **Reliability**
- Input validation
- Fallback responses if API fails
- Comprehensive error logging
- Production-ready error handling

✅ **Scalability**
- Modular architecture (Controller + Router pattern)
- Easy to extend with database logging
- Compatible with rate limiting middleware
- Follows Express.js best practices

---

## Customization

### 1. Modify Chatbot Behavior

Edit the `SYSTEM_PROMPT` in `ChatbotController.mjs` to change:
- The chatbot's personality
- Topics it can discuss
- Response style and tone

Example:
```javascript
const SYSTEM_PROMPT = `You are a professional hotel virtual assistant...
// Add or modify instructions here
`;
```

### 2. Update Widget Styling

Edit `ChatbotWidget.css` to customize:
- Colors and gradients
- Chat window size
- Font styles
- Button appearance

### 3. Add Message Logging

To store messages in MongoDB, modify `ChatbotController.mjs`:

```javascript
// After getting AI response, add:
const ChatMessage = require('../Models/ChatMessage');
await new ChatMessage({
  userMessage: message,
  botResponse: reply,
  timestamp: new Date(),
}).save();
```

### 4. Implement User Authentication

To track messages per user:

```javascript
// In ChatbotController.mjs
import { authenticate } from '../middleware/auth.mjs';

// Then in app.mjs:
app.use('/api/chatbot', authenticate, chatbotRoutes);
```

---

## Testing

### Manual Testing

1. **Start Backend**: `npm run dev` in Back-End folder
2. **Start Frontend**: `npm run dev` in Front-End folder
3. **Test Widget**:
   - Click the 💬 button in bottom-right
   - Type a hotel-related question
   - Verify the AI responds appropriately

### Test Cases

```
✓ "What are your rooms like?"
✓ "Can I book a room?"
✓ "What's your restaurant like?"
✓ "Are there facilities for swimming?"
✗ "What's 2+2?" (Should redirect to hotel topics)
✗ Empty messages (Should be handled gracefully)
```

---

## Troubleshooting

### Issue: Chatbot not responding

**Solution**:
1. Check if `ANTHROPIC_API_KEY` is set correctly in `.env`
2. Verify backend is running on `http://localhost:3000`
3. Check browser console for network errors
4. Ensure CORS is properly configured

### Issue: Slow responses

**Solution**:
1. Claude API may be rate-limited (default: 5 requests/minute)
2. Consider implementing request queuing
3. Add caching for common questions

### Issue: Widget not appearing

**Solution**:
1. Verify `ChatbotWidget` is imported in `App.jsx`
2. Check browser console for JavaScript errors
3. Ensure CSS file is loaded correctly
4. Check z-index isn't being overridden by other elements

### Issue: CORS errors

**Solution**:
1. Verify backend CORS configuration allows frontend origin
2. In `app.mjs`, update:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173', // Your frontend URL
     credentials: true
   }));
   ```

---

## Future Enhancements

1. **Message Persistence**: Store messages in MongoDB for analytics
2. **User Context**: Remember user preferences and previous bookings
3. **Multi-language Support**: Translate responses to guest's language
4. **Sentiment Analysis**: Detect guest satisfaction and escalate if needed
5. **Integration with CRM**: Pass booking info to chatbot context
6. **Hand-off to Human**: Seamlessly transfer to staff if needed
7. **Rate Limiting**: Implement API rate limiting to prevent abuse
8. **Analytics Dashboard**: Track chatbot performance metrics

---

## Code Comments Reference

Throughout the codebase, you'll see emoji-based comments:

| Emoji | Meaning |
|-------|---------|
| 🤖 | AI/Chatbot related |
| 💬 | Chat/Message related |
| 📝 | Input validation |
| ✅ | Success/working feature |
| ⚠️ | Warning/important note |
| 🔗 | API call/integration |
| 🔍 | Logging/debugging |
| ⬇️ | Auto-scroll/scroll related |

---

## Support & Resources

- **Anthropic API Docs**: https://docs.anthropic.com/
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev/
- **Project Issues**: Check GitHub repository

---

## License

This chatbot implementation is part of the LuxuryStay Hotel Management System project.
