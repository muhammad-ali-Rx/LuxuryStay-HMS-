# 🤖 Chatbot Examples & Code Snippets

## Test Conversations

### Example 1: Room Information
```
User: "What types of rooms do you have?"

Bot: "We offer Standard, Deluxe, and Suite rooms, each with premium 
amenities including flat-screen TVs, high-speed Wi-Fi, and luxury 
bedding. Room prices range from $100-$500 per night depending on type."
```

### Example 2: Booking Inquiry
```
User: "How do I book a room?"

Bot: "You can book through our website in the 'Rooms' section by 
selecting your preferred dates and room type, then proceeding to checkout. 
For assistance, our front desk team is available 24/7."
```

### Example 3: Services
```
User: "What services do you provide?"

Bot: "We offer 24/7 room service, housekeeping, concierge, valet parking, 
and a 5-star restaurant on-site. Our restaurant is open from 6 AM to 11 PM 
with both fine dining and casual options available."
```

### Example 4: Out of Scope (Bot Redirects)
```
User: "What's the capital of France?"

Bot: "I'm specifically trained to help with hotel-related inquiries. 
For general questions, feel free to ask me about our rooms, facilities, 
services, or booking process. Is there anything hotel-related I can help?"
```

---

## API Request/Response Examples

### Basic Message Request
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Can I check in early?"}'
```

### Response Format
```json
{
  "success": true,
  "reply": "Early check-in is subject to availability. I recommend contacting our front desk to request early check-in. Our receptionist team will do their best to accommodate your request.",
  "fallback": false
}
```

### Error Response
```json
{
  "success": true,
  "reply": "I'm having trouble connecting right now. Please try again in a moment.",
  "fallback": true
}
```

---

## Code Customization Examples

### 1. Add User Info to Context

**Modified ChatbotController.mjs:**
```javascript
export const chatbotChat = async (req, res) => {
  try {
    const { message, userName, roomNumber } = req.body;

    // Build contextual system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (userName) {
      systemPrompt += `\n\nGuest Name: ${userName}`;
    }
    if (roomNumber) {
      systemPrompt += `\nGuest Room: ${roomNumber}`;
    }

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemPrompt, // Use modified prompt
        messages: [{ role: 'user', content: message }],
      }),
    });
    // ... rest of code
  } catch (error) {
    // ... error handling
  }
};
```

### 2. Add Message History

**Modified ChatbotWidget.jsx:**
```javascript
// Store conversation history for context
const [conversationHistory, setConversationHistory] = useState([]);

const handleSendMessage = async (e) => {
  e.preventDefault();

  const userMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
  setMessages((prev) => [...prev, userMessage]);
  
  // Keep track of conversation history
  setConversationHistory((prev) => [
    ...prev,
    { role: 'user', content: inputValue }
  ]);

  // Send history to backend if needed
  const response = await fetch('http://localhost:3000/api/chatbot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: inputValue,
      conversationHistory: conversationHistory, // Send full history
    }),
  });
  // ... rest of code
};
```

### 3. Add Message Logging to MongoDB

**New Model: Models/ChatMessage.mjs**
```javascript
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  userMessage: {
    type: String,
    required: true,
  },
  botResponse: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  fallbackUsed: {
    type: Boolean,
    default: false,
  },
  responseTime: {
    type: Number, // milliseconds
    required: false,
  },
});

export default mongoose.model('ChatMessage', chatMessageSchema);
```

**Modified ChatbotController.mjs:**
```javascript
import ChatMessage from '../Models/ChatMessage.mjs';

export const chatbotChat = async (req, res) => {
  try {
    const startTime = Date.now();
    const { message, userId } = req.body;

    // ... existing code ...

    const responseTime = Date.now() - startTime;

    // Log message to database
    const chatLog = new ChatMessage({
      userId,
      userMessage: message,
      botResponse: reply,
      fallbackUsed: data.fallback || false,
      responseTime,
    });
    await chatLog.save();

    res.status(200).json({ success: true, reply });
  } catch (error) {
    // ... error handling
  }
};
```

### 4. Add Rate Limiting

**New Middleware: middleware/rateLimiter.mjs**
```javascript
import rateLimit from 'express-rate-limit';

export const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many messages. Please wait a moment before sending another.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Modified Routers/chatbotRoutes.mjs:**
```javascript
import { chatbotLimiter } from '../middleware/rateLimiter.mjs';

router.post('/chat', chatbotLimiter, chatbotChat);
```

### 5. Enhance System Prompt

**Advanced System Prompt for Better Responses:**
```javascript
const SYSTEM_PROMPT = `You are a professional hotel virtual assistant for LuxuryStay Hotel Management System. 

HOTEL FACTS:
- Check-in: 3 PM
- Check-out: 11 AM
- Rooms: Standard ($100), Deluxe ($250), Suite ($500)
- Restaurant: Open 6 AM - 11 PM
- Amenities: Pool, Gym, Spa, Business Center
- Services: 24/7 Room Service, Housekeeping, Concierge

GUEST ASSISTANCE GUIDELINES:
1. Answer questions about rooms, pricing, and services
2. Provide booking guidance
3. Explain hotel policies clearly
4. For specific requests, suggest contacting the front desk
5. Be warm, professional, and concise
6. Keep responses to 2-3 sentences maximum
7. When uncertain, ask clarifying questions

TONE: Friendly, professional, hotel concierge style
RESPONSE LENGTH: Brief and helpful (under 100 tokens)

If asked outside hotel topics, politely redirect:
"I'm specifically trained to help with hotel-related questions. 
Is there anything about our rooms, services, or booking I can help with?"`;
```

---

## Frontend Customizations

### Change Widget Position
**ChatbotWidget.css (line 10):**
```css
/* Bottom Right (default) */
bottom: 20px;
right: 20px;

/* Alternative: Bottom Left */
bottom: 20px;
left: 20px;

/* Alternative: Top Right */
top: 20px;
right: 20px;
```

### Customize Colors
**ChatbotWidget.jsx (line 172):**
```javascript
const botMessage = {
  id: messages.length + 2,
  text: data.reply,
  sender: 'bot',
  timestamp: new Date(),
  theme: 'luxury', // Add theme support
};
```

**ChatbotWidget.css (add luxury theme):**
```css
.message-bubble.luxury {
  background: linear-gradient(135deg, #d4af37 0%, #aa771c 100%);
  color: white;
}

.chatbot-toggle.luxury {
  background: linear-gradient(135deg, #d4af37 0%, #aa771c 100%);
}
```

---

## Testing Code

### Unit Test Example (Jest)
```javascript
describe('ChatbotController', () => {
  it('should return a valid response for hotel question', async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const req = {
      body: { message: 'What are your room options?' },
    };

    await chatbotChat(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        reply: expect.any(String),
      })
    );
  });

  it('should handle empty messages', async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const req = {
      body: { message: '' },
    };

    await chatbotChat(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

---

## Performance Optimization

### Add Response Caching
```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTtl: 600 }); // 10 min cache

export const chatbotChat = async (req, res) => {
  const { message } = req.body;
  const cacheKey = message.toLowerCase();

  // Check cache first
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return res.json({ success: true, reply: cachedResponse, cached: true });
  }

  // ... API call ...

  // Store in cache
  cache.set(cacheKey, reply);
  res.json({ success: true, reply });
};
```

---

## Deployment Checklist

- [ ] Set `ANTHROPIC_API_KEY` on hosting platform
- [ ] Update API endpoint URL in `ChatbotWidget.jsx`
- [ ] Enable CORS for production domain
- [ ] Add rate limiting middleware
- [ ] Enable message logging to database
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test on production environment
- [ ] Monitor API usage and costs
- [ ] Set up backup fallback responses
- [ ] Document custom modifications

