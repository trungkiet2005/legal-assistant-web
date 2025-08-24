import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add current message to history
      conversationHistory.push({
        role: 'user',
        content: userMessage.content
      });

      const response = await axios.post('https://8a7663969b97.ngrok-free.app/chat', {
        message: userMessage.content,
        conversation_history: conversationHistory
      });

      // Process AI response to handle asterisks
      const processedContent = response.data.response
        .replace(/\*\*/g, '**') // Keep bold formatting
        .replace(/\*/g, '') // Remove single asterisks
        .trim();

      const botMessage = {
        role: 'assistant',
        content: processedContent,
        timestamp: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: t('chatbot.errorMessage'),
        timestamp: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chatbot">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1>{t('chatbot.title')}</h1>
          <button onClick={clearChat} className="clear-button">
            {t('chatbot.clearChat')}
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-icon">⚖️</div>
              <h3>{t('chatbot.welcome.title')}</h3>
              <p>{t('chatbot.welcome.message')}</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {message.timestamp}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.placeholder')}
              disabled={isLoading}
              rows="1"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '⏳' : t('chatbot.send')}
            </button>
          </div>
          <div className="input-hint">
            {t('chatbot.inputHint')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
