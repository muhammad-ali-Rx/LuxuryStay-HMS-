// 🤖 Hotel AI Chatbot Controller
// This controller handles communication with OpenAI ChatGPT API
// Uses your own API key for hotel-related assistant features
// Uses native Node.js fetch (v18+) - no external dependencies needed

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
 * @returns {string} reply - AI-generated response from ChatGPT
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

    // 🤖 Call OpenAI ChatGPT API
    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Fast and affordable model
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
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

    // ✅ Parse and return ChatGPT's response
    const data = await apiResponse.json();
    const reply =
      data.choices?.[0]?.message?.content ||
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
