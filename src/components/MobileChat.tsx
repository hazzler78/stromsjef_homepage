"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatContactForm from './ChatContactForm';

// Markdown rendering function (same as GrokChat)
function renderMarkdown(text: string) {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0;"><code style="font-family: monospace; white-space: pre;">$1</code></pre>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">$1</a>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 8px 0; color: #6b7280;">$1</blockquote>');
  
  // Lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^[\s]*[-*+] (.*$)/gim, '<li>$1</li>');
  
  // Wrap lists
  const lines = html.split('\n');
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<li>')) {
      if (!inList) {
        listType = line.match(/^\d+\./) ? 'ol' : 'ul';
        lines[i] = `<${listType}>${line}`;
        inList = true;
      }
    } else if (inList && line.trim() === '') {
      lines[i] = `</${listType}>${line}`;
      inList = false;
    }
  }
  
  if (inList) {
    lines[lines.length - 1] += `</${listType}>`;
  }
  
  return lines.join('\n');
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MobileChatProps {
  className?: string;
}

export default function MobileChat({ className = '' }: MobileChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hei! Jeg er Elge – spør meg om strømavtaler, bytte eller strømpriser så hjelper jeg deg med en gang.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const [startHereSubmitted, setStartHereSubmitted] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorSubmitted, setCalculatorSubmitted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Handle keyboard detection and viewport changes
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const vp = window.visualViewport;
        setViewportHeight(vp.height);
        setKeyboardHeight(window.innerHeight - vp.height);
      }
    };

    // Initial viewport height
    setViewportHeight(window.innerHeight);

    // Listen for viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showContactForm, showStartHere, showCalculator]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/grokchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          messages: [...messages, userMessage]
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // Handle special triggers
      if (data.response.includes('[SHOW_CONTACT_FORM]')) {
        setShowContactForm(true);
        setShowStartHere(false);
        setShowCalculator(false);
      } else if (data.response.includes('[SHOW_START_HERE]')) {
        setShowStartHere(true);
        setShowContactForm(false);
        setShowCalculator(false);
      } else if (data.response.includes('[SHOW_CALCULATOR]')) {
        setShowCalculator(true);
        setShowContactForm(false);
        setShowStartHere(false);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Beklager, det oppstod en feil. Prøv igjen senere.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStartHere = () => {
    setStartHereSubmitted(true);
    setShowStartHere(false);
    window.location.href = '/starta-har';
  };

  const handleCalculator = () => {
    setCalculatorSubmitted(true);
    setShowCalculator(false);
    window.location.href = '/jamfor-elpriser';
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hei! Jeg er Elge – spør meg om strømavtaler, bytte eller strømpriser så hjelper jeg deg med en gang.'
      }
    ]);
    setShowContactForm(false);
    setContactFormSubmitted(false);
    setShowStartHere(false);
    setStartHereSubmitted(false);
    setShowCalculator(false);
    setCalculatorSubmitted(false);
  };

  const toggleChat = () => {
    console.log('Toggling chat, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  // Calculate dynamic styles based on keyboard state
  const chatWindowStyle = {
    height: isOpen ? `min(80vh, ${viewportHeight - 20}px)` : '0',
    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
    paddingBottom: keyboardHeight > 0 ? `${Math.max(keyboardHeight - 20, 0)}px` : '0px',
    minHeight: isOpen ? '400px' : '0', // Säkerställer minsta höjd
  };

  return (
    <>
      {/* Fixed Chat Bubble Button (hidden while chat is open to avoid overlap) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="mobile-chat-bubble"
          aria-label="Åpne chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat Window Overlay */}
      {isOpen && (
        <div className="mobile-chat-overlay" onClick={toggleChat}>
          <div 
            className="mobile-chat-window"
            style={chatWindowStyle}
            onClick={(e) => e.stopPropagation()}
            ref={chatContainerRef}
          >
            {/* Chat Header */}
            <div className="mobile-chat-header">
              <div className="mobile-chat-title">
                <span style={{ fontSize: 16, marginRight: 6, fontWeight: 'bold' }}>Elge</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>AI-assistent</span>
              </div>
              <div className="mobile-chat-actions">
                <button 
                  onClick={clearChat}
                  className="mobile-chat-clear-btn"
                  title="Tøm chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
                <button 
                  onClick={toggleChat}
                  className="mobile-chat-close-btn"
                  title="Lukk chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="mobile-chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`mobile-chat-message ${message.role}`}>
                  <div className="mobile-chat-message-content">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdown(message.content) 
                      }} 
                    />
                  </div>
                </div>
              ))}
              
              {/* Special Action Buttons */}
              {showStartHere && !startHereSubmitted && (
                <div className="mobile-chat-action-buttons">
                  <button 
                    onClick={handleStartHere}
                    className="mobile-chat-action-btn mobile-chat-start-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                    </svg>
                    Start her
                  </button>
                </div>
              )}

              {showCalculator && !calculatorSubmitted && (
                <div className="mobile-chat-action-buttons">
                  <button 
                    onClick={handleCalculator}
                    className="mobile-chat-action-btn mobile-chat-calculator-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="4" height="4" x="3" y="3" rx="1"></rect>
                      <rect width="4" height="4" x="17" y="3" rx="1"></rect>
                      <rect width="4" height="4" x="3" y="17" rx="1"></rect>
                      <rect width="4" height="4" x="17" y="17" rx="1"></rect>
                      <path d="M9 9h6v6H9z"></path>
                    </svg>
                    AI-kalkylator
                  </button>
                </div>
              )}

              {/* Contact Form */}
              {showContactForm && !contactFormSubmitted && (
                <div className="mobile-chat-contact-form">
                  <ChatContactForm 
                    onSubmitted={() => setContactFormSubmitted(true)}
                    onClose={() => setShowContactForm(false)}
                  />
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="mobile-chat-message assistant">
                  <div className="mobile-chat-message-content">
                    <div className="mobile-chat-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mobile-chat-input-area">
              <div className="mobile-chat-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    contactFormSubmitted 
                      ? "Takk for din henvendelse! Hva kan jeg hjelpe deg med?"
                      : startHereSubmitted
                      ? "Perfekt! Hva mer kan jeg hjelpe deg med?"
                      : calculatorSubmitted
                      ? "Bra! Hva annet kan jeg hjelpe deg med?"
                      : "Skriv din melding her..."
                  }
                  disabled={isLoading || contactFormSubmitted || startHereSubmitted || calculatorSubmitted}
                  className="mobile-chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || contactFormSubmitted || startHereSubmitted || calculatorSubmitted}
                  className="mobile-chat-send-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
