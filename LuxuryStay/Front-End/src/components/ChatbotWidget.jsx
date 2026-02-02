// 🤖 Hotel AI Chatbot Widget
// Floating chat interface for guests to interact with the hotel AI assistant
// Positioned at bottom-right of the screen

import { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

export default function ChatbotWidget() {
  // 📋 State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your LuxuryStay AI Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ⬇️ Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle sending a message
   * - Add user message to chat
   * - Show loading state
   * - Call backend API
   * - Display bot response
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // 📝 Validate input
    if (!inputValue.trim()) {
      return;
    }

    // ✅ Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 🔗 Call backend chatbot API
      const response = await fetch('http://localhost:3000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // 🤖 Add bot response to chat
      const botMessage = {
        id: messages.length + 2,
        text:
          data.reply ||
          'I apologize, but I could not process your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('[Chatbot Widget] Error:', error);

      // ⚠️ Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again or contact our front desk.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* 💬 Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-content">
              <h3>🏨 LuxuryStay Assistant</h3>
              <p>We're here to help</p>
            </div>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.sender === 'bot' && <span className="bot-avatar">🤖</span>}
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="message bot-message">
                <span className="bot-avatar">🤖</span>
                <div className="message-bubble loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask me something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="message-input"
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
              aria-label="Send message"
            >
              📤
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button - Bottom Right */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
