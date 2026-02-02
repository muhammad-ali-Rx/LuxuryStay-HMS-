// 🤖 Hotel AI Chatbot Controller
// This controller handles communication with Anthropic's Claude API
// to provide hotel-related information and assistance to guests

import fetch from 'node-fetch';

// System prompt that defines the chatbot's behavior and knowledge
const SYSTEM_PROMPT = `You are a professional hotel virtual assistant for LuxuryStay Hotel Management System. 
Help guests politely and concisely with:
- Room information and features
- Pricing and booking guidance
- Hotel services (housekeeping, room service, concierge)
- Check-in/check-out times and policies
- Restaurant and dining information
- Facilities and amenities
- General hotel inquiries

Tone: Friendly, professional, hotel concierge style
Keep responses brief (2-3 sentences max) and helpful.
If asked about something outside hotel services, politely redirect to hotel-related topics.
If uncertain about specific details, suggest contacting the front desk directly.`;

// Fallback responses for when API fails
const FALLBACK_RESPONSES = [
  "I'm having trouble connecting right now. Please try again in a moment.",
  "Our services are temporarily unavailable. The front desk team is always ready to help!",
  "I apologize for the inconvenience. Please contact our front desk for immediate assistance.",
];

/**
 * Main chatbot handler - receives user message and returns AI response
 * @route POST /api/chatbot/chat
 * @param {string} message - User's message/question
 * @returns {string} reply - AI-generated response from Claude
 */
export const chatbotChat = async (req, res) => {
  try {
    const { message } = req.body;

    // 📝 Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Invalid message format. Please send a valid string.",
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty.",
      });
    }

    // 🔍 Log incoming request for debugging
    console.log("[Chatbot] Received message:", message);

    // 🤖 Call Anthropic API (Claude)
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Latest Claude model
        max_tokens: 300, // Keep responses concise
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    // 🔍 Check if API call was successful
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('[Chatbot] API Error:', errorData);

      // Return fallback response if API fails
      const fallbackReply =
        FALLBACK_RESPONSES[
          Math.floor(Math.random() * FALLBACK_RESPONSES.length)
        ];
      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        fallback: true,
      });
    }

    // ✅ Parse and return Claude's response
    const data = await apiResponse.json();
    const reply =
      data.content[0]?.text ||
      'I apologize, but I could not generate a response. Please try again.';

    console.log('[Chatbot] Response generated:', reply);

    res.status(200).json({
      success: true,
      reply,
      fallback: false,
    });
  } catch (error) {
    console.error('[Chatbot] Unexpected error:', error.message);

    // Return fallback response on any error
    const fallbackReply =
      FALLBACK_RESPONSES[
        Math.floor(Math.random() * FALLBACK_RESPONSES.length)
      ];
    res.status(200).json({
      success: true,
      reply: fallbackReply,
      fallback: true,
    });
  }
};
