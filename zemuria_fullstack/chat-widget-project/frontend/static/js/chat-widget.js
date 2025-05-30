class ChatWidget {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
    this.sessionId = this.generateSessionId();
    this.isMinimized = false;
    this.init();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    widget.innerHTML = `
            <div class="chat-header" onclick="chatWidget.toggleMinimize()">
                <div class="chat-title">💬 Support Chat</div>
                <button class="chat-toggle">−</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message ai">
                    <div class="message-bubble">
                        Hi! I'm here to help. How can I assist you today?
                    </div>
                    <div class="message-time">${this.formatTime(new Date())}</div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="chat-input" 
                       placeholder="Type your message..." maxlength="500">
                <button class="chat-send-btn" id="chat-send-btn" onclick="chatWidget.sendMessage()">
                    ➤
                </button>
            </div>
        `;
    document.body.appendChild(widget);
    this.widget = widget;
  }

  attachEventListeners() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize input
    input.addEventListener('input', () => {
      if (input.value.length > 0) {
        sendBtn.style.opacity = '1';
      } else {
        sendBtn.style.opacity = '0.6';
      }
    });
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const toggle = this.widget.querySelector('.chat-toggle');

    if (this.isMinimized) {
      this.widget.classList.add('minimized');
      toggle.textContent = '+';
    } else {
      this.widget.classList.remove('minimized');
      toggle.textContent = '−';
    }
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    this.addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          session_id: this.sessionId
        })
      });

      const data = await response.json();

      // Remove typing indicator
      this.hideTypingIndicator();

      if (response.ok) {
        this.addMessage(data.response, 'ai');
      } else {
        this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Sorry, I\'m having trouble connecting. Please check your internet connection.', 'ai');
    }
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const now = new Date();
    messageDiv.innerHTML = `
            <div class="message-bubble">${this.escapeHtml(text)}</div>
            <div class="message-time">${this.formatTime(now)}</div>
        `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chat widget when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.chatWidget = new ChatWidget();
});