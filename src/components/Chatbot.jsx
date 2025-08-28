import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { t } = useLanguage();
  const { currentLanguage } = useLanguage();

  const BASE_URL = 'https://4c88ce69f383.ngrok-free.app';

  // TTS state by message index
  const [ttsStates, setTtsStates] = useState({});
  const audioRefs = useRef({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const validateAndSetFile = (file) => {
    if (!file) return false;

    // Kiểm tra kích thước file (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`File quá lớn. Kích thước tối đa là ${formatFileSize(maxSize)}`);
      return false;
    }

    // Kiểm tra loại file được hỗ trợ
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!supportedTypes.includes(file.type)) {
      alert('Loại file không được hỗ trợ. Vui lòng chọn file ảnh, PDF, Word hoặc text.');
      return false;
    }

    setSelectedFile(file);
    
    // Tạo preview cho ảnh
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    return true;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedFile) || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim() || (selectedFile ? `Đã gửi file: ${selectedFile.name}` : ''),
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      file: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        preview: filePreview
      } : null
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

      let response;

      if (selectedFile) {
        // Gửi file cùng với tin nhắn
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('message', inputMessage.trim() || 'Hãy phân tích file này');
        formData.append('conversation_history', JSON.stringify(conversationHistory));

        response = await axios.post(`${BASE_URL}/chat-with-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Gửi tin nhắn thông thường
        response = await axios.post(`${BASE_URL}/multiagent`, {
          message: userMessage.content,
          conversation_history: conversationHistory
        });
      }

      // Process AI response to handle asterisks and add bullet points
      const processedContent = response.data.response
        .replace(/\*\*/g, '**') // Keep bold formatting
        .replace(/^\s*[-*]\s+/gm, '• ') // Convert dashes and asterisks at line start to bullet points
        .replace(/\*/g, '') // Remove remaining single asterisks
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
      
      // Xóa file sau khi gửi thành công
      removeFile();
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

  const handleToggleSpeak = async (index, text) => {
    try {
      const existingState = ttsStates[index] || {};
      const existingAudio = audioRefs.current[index];

      // If we already have audio and it's playing, pause it
      if (existingAudio && !existingAudio.paused) {
        existingAudio.pause();
        existingAudio.currentTime = 0;
        setTtsStates(prev => ({
          ...prev,
          [index]: { ...prev[index], playing: false }
        }));
        return;
      }

      // If audio URL is cached, just play
      if (existingState.audioUrl && existingAudio) {
        await existingAudio.play();
        setTtsStates(prev => ({
          ...prev,
          [index]: { ...prev[index], playing: true }
        }));
        return;
      }

      // Otherwise, request TTS generation
      setTtsStates(prev => ({
        ...prev,
        [index]: { ...prev[index], loading: true }
      }));

      const language = currentLanguage === 'vi' ? 'vi' : 'en';
      const ttsPayload = {
        text,
        voice: 'Kore',
        language
      };

      const ttsResponse = await axios.post(`${BASE_URL}/tts`, ttsPayload);
      const result = ttsResponse.data || {};

      if (!result.audio_file) {
        throw new Error('No audio_file from TTS');
      }

      const filename = String(result.audio_file).split('/').pop();
      const audioResponse = await axios.get(`${BASE_URL}/tts/audio/${filename}`, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(audioResponse.data);

      const audio = new Audio(objectUrl);
      audio.onended = () => {
        setTtsStates(prev => ({
          ...prev,
          [index]: { ...prev[index], playing: false }
        }));
      };

      audioRefs.current[index] = audio;

      await audio.play();

      setTtsStates(prev => ({
        ...prev,
        [index]: { audioUrl: objectUrl, loading: false, playing: true }
      }));
    } catch (e) {
      console.error('TTS error:', e);
      setTtsStates(prev => ({
        ...prev,
        [index]: { ...prev[index], loading: false, playing: false }
      }));
      alert('Không thể phát âm thanh. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup audio objects and revoke URLs
      Object.values(audioRefs.current).forEach(audio => {
        try { audio.pause(); } catch {}
      });
      Object.values(ttsStates).forEach(state => {
        if (state && state.audioUrl) {
          try { URL.revokeObjectURL(state.audioUrl); } catch {}
        }
      });
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    removeFile();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                {message.content.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>
                    {line}
                    {lineIndex < message.content.split('\n').length - 1 && <br />}
                  </div>
                ))}
                
                {/* Hiển thị file đính kèm */}
                {message.file && (
                  <div className="file-attachment">
                    {message.file.preview ? (
                      <div className="file-preview">
                        <img src={message.file.preview} alt={message.file.name} />
                        <div className="file-info">
                          <span className="file-name">{message.file.name}</span>
                          <span className="file-size">{formatFileSize(message.file.size)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="file-info">
                        <span className="file-icon">📎</span>
                        <span className="file-name">{message.file.name}</span>
                        <span className="file-size">{formatFileSize(message.file.size)}</span>
                      </div>
                    )}
                  </div>
                )}

                {message.role === 'assistant' && (
                  <div className="message-actions">
                    <button
                      className="audio-button"
                      onClick={() => handleToggleSpeak(index, message.content)}
                      title={ttsStates[index]?.playing ? 'Dừng phát' : 'Phát âm thanh'}
                      disabled={ttsStates[index]?.loading}
                    >
                      {ttsStates[index]?.loading ? '⏳' : ttsStates[index]?.playing ? '⏹️ Dừng' : '🔊 Đọc'}
                    </button>
                  </div>
                )}
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

        <div className={`chat-input ${isDragOver ? 'drag-over' : ''}`}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}>
          {/* File preview */}
          {selectedFile && (
            <div className="file-preview-container">
              <div className="file-preview-content">
                {filePreview ? (
                  <img src={filePreview} alt={selectedFile.name} className="file-preview-image" />
                ) : (
                  <div className="file-preview-icon">📎</div>
                )}
                <div className="file-preview-info">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                </div>
                <button onClick={removeFile} className="remove-file-btn">✕</button>
              </div>
            </div>
          )}

          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.placeholder')}
              disabled={isLoading}
              rows="1"
            />
            
            <div className="input-buttons">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="file-button"
                title={t('chatbot.fileUpload.title')}
              >
                📎
              </button>
              <button
                onClick={sendMessage}
                disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
                className="send-button"
              >
                {isLoading ? '⏳' : t('chatbot.send')}
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
          />
          
          <div className="input-hint">
            {t('chatbot.inputHint')} • {t('chatbot.fileUpload.supportedFormats')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
