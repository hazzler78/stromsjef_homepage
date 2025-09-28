"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatContactForm from './ChatContactForm';

function renderMarkdown(text: string) {
  if (!text) return '';
  
  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Headers (h1-h6)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic (handle nested cases)
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>'); // ***bold italic***
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **bold**
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // *italic*
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  
  // Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0;"><code style="font-family: monospace; white-space: pre;">$1</code></pre>');
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">$1</a>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 8px 0; color: #6b7280;">$1</blockquote>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Bullet lists (improved regex)
  html = html.replace(/^[\s]*[-*+] (.*$)/gim, '<li>$1</li>');
  
  // Wrap lists in ul/ol tags
  const lines = html.split('\n');
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^<li>/.test(line);
    const isNumberedListItem = /^\d+\./.test(line);
    
    if (isListItem && !inList) {
      inList = true;
      listType = isNumberedListItem ? 'ol' : 'ul';
      lines[i] = `<${listType} style="margin: 8px 0; padding-left: 20px;">${line}`;
    } else if (!isListItem && inList) {
      inList = false;
      lines[i-1] = lines[i-1] + `</${listType}>`;
    }
  }
  
  // Close any open list
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + `</${listType}>`;
  }
  
  html = lines.join('\n');
  
  // Line breaks (handle multiple consecutive breaks)
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');
  
  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote') && !html.startsWith('<pre')) {
    html = `<p style="margin: 0; line-height: 1.6;">${html}</p>`;
  }
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  html = html.replace(/<p[^>]*>\s*<br\/>\s*<\/p>/g, '');
  
  return html;
}

const initialMessages = [
  {
    role: 'assistant',
    content:
      'Hei! Jeg er Elge – spør meg om strømavtaler, bytte eller strømpriser så hjelper jeg deg med en gang.'
  }
];

function ElgeIcon() {
  return (
    <img
      src="/elge_stromsjef.jpg"
      alt="Elge"
      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 20%', marginRight: 6, boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }}
    />
  );
}

// Generera en unik session ID för denna konversation
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function GrokChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const [startHereSubmitted, setStartHereSubmitted] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorSubmitted, setCalculatorSubmitted] = useState(false);

  
  // Debug: Log when showContactForm changes
  useEffect(() => {
    console.log('showContactForm state:', showContactForm);
  }, [showContactForm]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  // Generera session ID när komponenten mountas
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  // Responsiv bottom-position för chatbubblan och chat window
  const [chatBottom, setChatBottom] = useState(24);
  const [chatWindowBottom, setChatWindowBottom] = useState(90);
  const [chatWindowHeight, setChatWindowHeight] = useState(480);
  
  useEffect(() => {
    function selectCookieBannerElement(): HTMLElement | null {
      const candidates = [
        '#CybotCookiebotDialog',
        '[id^="CybotCookiebot"]',
        '#CookiebotDialog',
        '.CookieConsent',
        '.CookiebotWidget',
        '#CookieConsent',
        '#CookieDeclaration',
        '.cookieconsent',
        '.cookie-declaration',
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[id*="Cookie"]',
        '[class*="Cookie"]',
      ];
      for (const selector of candidates) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) return el;
      }
      return null;
    }

    function isElementVisible(el: HTMLElement): boolean {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    }

    function updatePositions() {
      const mobile = window.innerWidth <= 600;
      
      // Check for cookie banner
      let cookieOffset = 0;
      let bottomNavOffset = 0;
      try {
        const banner = selectCookieBannerElement();
        if (banner && isElementVisible(banner)) {
          const rect = banner.getBoundingClientRect();
          const isAtBottom = Math.abs(window.innerHeight - rect.bottom) < 10;
          const isOverlappingBottom = rect.bottom > window.innerHeight - 100;
          
          if (isAtBottom || isOverlappingBottom) {
            cookieOffset = Math.ceil(rect.height) + 10;
          }
        }
      } catch {
        // Ignore errors
      }
      
      // Detect our fixed bottom nav to avoid overlap
      try {
        const bottomNav = document.querySelector('[data-bottom-nav="true"]') as HTMLElement | null;
        if (bottomNav) {
          const navRect = bottomNav.getBoundingClientRect();
          if (navRect.height > 0) {
            bottomNavOffset = Math.ceil(navRect.height) + 16; // add small gap
          }
        }
      } catch {}

      // Account for bottom navigation height plus cookie banner
      const totalOffset = cookieOffset + bottomNavOffset;
      setChatBottom(mobile ? 24 + totalOffset : 24 + totalOffset);
      setChatWindowBottom(mobile ? 90 + totalOffset : 90 + totalOffset);
      setChatWindowHeight(mobile ? 400 : 480);
    }
    
    updatePositions();
    window.addEventListener('resize', updatePositions);
    
    // Observe DOM mutations to detect when Cookiebot injects/hides the banner
    const observer = new MutationObserver(() => updatePositions());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    
    // Also poll as a fallback
    const interval = window.setInterval(updatePositions, 1000);
    
    return () => {
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  // Scrolla till toppen när chatten öppnas, annars ingen automatisk scroll
  useEffect(() => {
    if (open && !prevOpenRef.current && chatContainerRef.current) {
      // Chatten öppnas nu
      chatContainerRef.current.scrollTop = 0;
    }
    prevOpenRef.current = open;
  }, [open]);

  const sendMessage = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await fetch('/api/grokchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          sessionId: sessionId // Skicka med session ID
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Noe gikk galt.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      let aiMsg = data.choices?.[0]?.message?.content || 'Jeg kunne dessverre ikke svare akkurat nå.';
      
      // Check if AI wants to show contact form
      if (aiMsg.includes('[SHOW_CONTACT_FORM]')) {
        console.log('Contact form trigger detected!');
        aiMsg = aiMsg.replace('[SHOW_CONTACT_FORM]', '');
        setShowContactForm(true);
      }
      
      // Check if contact form has been submitted
      if (aiMsg.includes('[CONTACT_FORM_SUBMITTED]')) {
        console.log('Contact form submitted trigger detected!');
        aiMsg = aiMsg.replace('[CONTACT_FORM_SUBMITTED]', '');
        setContactFormSubmitted(true);
        setShowContactForm(false);
      }
      
      // Check if AI wants to show start here button
      if (aiMsg.includes('[SHOW_START_HERE]')) {
        console.log('Start here trigger detected!');
        aiMsg = aiMsg.replace('[SHOW_START_HERE]', '');
        setShowStartHere(true);
      }
      
      // Check if start here has been submitted
      if (aiMsg.includes('[START_HERE_SUBMITTED]')) {
        console.log('Start here submitted trigger detected!');
        aiMsg = aiMsg.replace('[START_HERE_SUBMITTED]', '');
        setStartHereSubmitted(true);
        setShowStartHere(false);
      }
      
      // Check if AI wants to show calculator
      if (aiMsg.includes('[SHOW_CALCULATOR]')) {
        console.log('Calculator trigger detected!');
        aiMsg = aiMsg.replace('[SHOW_CALCULATOR]', '');
        setShowCalculator(true);
      }
      
      // Check if calculator has been submitted
      if (aiMsg.includes('[CALCULATOR_SUBMITTED]')) {
        console.log('Calculator submitted trigger detected!');
        aiMsg = aiMsg.replace('[CALCULATOR_SUBMITTED]', '');
        setCalculatorSubmitted(true);
        setShowCalculator(false);
      }
      
      // Remove greeting on subsequent assistant replies
      const assistantRepliesSoFar = newMessages.filter(m => m.role === 'assistant').length;
      if (assistantRepliesSoFar >= 1) {
        aiMsg = aiMsg.replace(/^\s*(Hei|Heisann|Hallo|God\s*(morgen|dag|kveld))[,!\.\s-]*/i, '').trimStart();
      }
      
      setMessages([...newMessages, { role: 'assistant', content: aiMsg }]);
    } catch {
      setError('Kunne ikke kontakte AI-en.');
    } finally {
      setLoading(false);
    }
  };

  // Funktion för att rensa chatten och starta ny session
  const clearChat = () => {
    setMessages(initialMessages);
    setInput('');
    setSessionId(generateSessionId()); // Generera ny session ID
    setShowContactForm(false);
    setContactFormSubmitted(false);
    setShowStartHere(false);
    setStartHereSubmitted(false);
    setShowCalculator(false);
    setCalculatorSubmitted(false);
  };

  // Funktion för att hantera Start här knapp
  const handleStartHere = () => {
    setShowStartHere(false);
    setStartHereSubmitted(true);
    
    // Lägg till användarens val i chatten
    const choiceMessage = 'Jeg vil starte her og finne riktig avtale';
    
    setMessages(prev => [...prev, { role: 'user', content: choiceMessage }]);
    
    // Lägg till en notifiering i chatten
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '**🎯 Perfekt!** Du sendes nå til vår avtalsfinner...' 
    }]);
    
    // Navigering till start-her sidan efter kort fördröjning
    setTimeout(() => {
      window.location.href = '/start-her';
    }, 2000); // 2 sekunders fördröjning så användaren hinner se AI-svaret
  };

  // Funktion för att stänga Start här
  const closeStartHere = () => {
    setShowStartHere(false);
    const newMessages = [...messages, { role: 'user', content: 'Nei takk, jeg tenker meg om' }];
    setMessages(newMessages);
  };

  // Funktion för att hantera AI-kalkylator
  const handleCalculator = async () => {
    setShowCalculator(false);
    setCalculatorSubmitted(true);
    
    // Lägg till användarens val i chatten
    const choiceMessage = 'Jeg vil bruke AI-kalkylatoren';
    
    setMessages(prev => [...prev, { role: 'user', content: choiceMessage }]);
    
    // Skicka meddelande till AI för bekräftelse
    const response = await fetch('/api/grokchat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: choiceMessage }],
        sessionId,
        contractChoice: 'calculator',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      
      // Navigering till jamfor-elpriser sidan efter kort fördröjning
      setTimeout(() => {
        window.location.href = '/jamfor-elpriser';
      }, 2000); // 2 sekunders fördröjning så användaren hinner se AI-svaret
    }
  };

  // Funktion för att stänga AI-kalkylator
  const closeCalculator = () => {
    setShowCalculator(false);
    const newMessages = [...messages, { role: 'user', content: 'Nei takk, jeg trenger ikke kalkulator' }];
    setMessages(newMessages);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: chatBottom,
          right: 16,
          zIndex: 1004,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: 'var(--glass-shadow-light)',
          fontSize: 28,
          cursor: 'pointer',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          padding: 0
        }}
        aria-label={open ? 'Lukk chat' : 'Åpne chat'}
      >
        <img src="/elge_stromsjef.jpg" alt="Elge" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
      </button>
      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: chatWindowBottom,
            right: 12,
            left: 12,
            width: 'auto',
            maxWidth: 'none',
            height: chatWindowHeight,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 18,
            boxShadow: 'var(--glass-shadow-heavy)',
            zIndex: 1004,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            color: 'white', 
            padding: '1rem', 
            fontWeight: 700, 
            fontSize: 19, 
            letterSpacing: 0.2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span><ElgeIcon /> Elge – AI-chat</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={clearChat}
                style={{ 
                  background: 'rgba(255,255,255,0.13)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  borderRadius: 6, 
                  padding: '2px 10px', 
                  marginRight: 2,
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  transition: 'all 0.2s ease'
                }}
                title="Rensa chatten"
                aria-label="Rensa chatten"
              >
                🗑
              </button>
              <button 
                onClick={() => setOpen(false)} 
                style={{ 
                  background: 'rgba(255,255,255,0.13)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  fontSize: 22, 
                  cursor: 'pointer',
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  transition: 'all 0.2s ease'
                }} 
                aria-label="Lukk"
              >
                ×
              </button>
            </div>
          </div>
          <div
            ref={chatContainerRef}
            style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'rgba(248, 250, 252, 0.8)' }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && <ElgeIcon />}
                <div style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255, 255, 255, 0.9)',
                  color: msg.role === 'user' ? 'white' : '#17416b',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 'calc(100vw - 80px)',
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: 'var(--glass-shadow-light)',
                  wordBreak: 'break-word',
                  lineHeight: 1.7,
                  marginLeft: msg.role === 'user' ? 0 : 8,
                  marginRight: msg.role === 'user' ? 8 : 0,
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    {msg.role === 'user' ? 'Du' : 'Elge'}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                marginBottom: 18,
              }}>
                <ElgeIcon />
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#17416b',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 'calc(100vw - 80px)',
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: 'var(--glass-shadow-light)',
                  marginLeft: 8,
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    Elge
                  </div>
                  <div>Skriver...</div>
                </div>
              </div>
            )}
            {showContactForm && (
              <div style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}>
                <ElgeIcon />
                <div style={{
                  background: '#e0f2fe',
                  color: '#17416b',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 'calc(100vw - 80px)',
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,106,167,0.12)',
                  marginLeft: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    Elge
                  </div>
                  <ChatContactForm 
                    onClose={() => setShowContactForm(false)} 
                    onSubmitted={() => {
                      // Add a message indicating the form was submitted
                      const newMessages = [...messages, { 
                        role: 'assistant', 
                        content: 'Takk for din kontakt! Vi kommer tilbake så snart som mulig. Ha en fin dag!'
                      }];
                      setMessages(newMessages);
                      setContactFormSubmitted(true);
                    }}
                  />
                </div>
              </div>
            )}
            {showStartHere && (
              <div style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}>
                <ElgeIcon />
                <div style={{
                  background: '#e0f2fe',
                  color: '#17416b',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 'calc(100vw - 80px)',
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,106,167,0.12)',
                  marginLeft: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    Elge
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>🎯 Perfekt!</strong> La meg hjelpe deg finne riktig avtale for din situasjon.
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <button
                      onClick={handleStartHere}
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'var(--glass-shadow-light)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = 'var(--glass-shadow-medium)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = 'var(--glass-shadow-light)';
                      }}
                    >
                      Start her
                    </button>
                    <button
                      onClick={closeStartHere}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#17416b',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                      }}
                    >
                      Nei takk, jeg tenker meg om
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showCalculator && (
              <div style={{
                marginBottom: 18,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}>
                <ElgeIcon />
                <div style={{
                  background: '#e0f2fe',
                  color: '#17416b',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: 'calc(100vw - 80px)',
                  fontSize: 16,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,106,167,0.12)',
                  marginLeft: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
                    Elge
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>🧮 Perfekt!</strong> La meg hjelpe deg beregne dine strømkostnader og finne besparelser.
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <button
                      onClick={handleCalculator}
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 16px',
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'var(--glass-shadow-light)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = 'var(--glass-shadow-medium)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = 'var(--glass-shadow-light)';
                      }}
                    >
                      AI-kalkulator
                    </button>
                    <button
                      onClick={closeCalculator}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#17416b',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                      }}
                    >
                      Nei takk, jeg trenger ikke kalkulator
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error && <div style={{ color: 'red', fontSize: 15, marginLeft: 8 }}>{error}</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{ 
            display: 'flex', 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '0.5rem',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}>
            <input
              type="text"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder={contactFormSubmitted ? "Takk for din kontakt!" : startHereSubmitted ? "Takk for ditt valg!" : calculatorSubmitted ? "Takk for ditt valg!" : "Skriv spørsmålet ditt…"}
              style={{ 
                flex: 1, 
                border: '1px solid rgba(203, 213, 225, 0.5)', 
                borderRadius: 12, 
                padding: '0.8rem 1rem', 
                fontSize: 16, 
                outline: 'none', 
                background: contactFormSubmitted || startHereSubmitted || calculatorSubmitted ? 'rgba(243, 244, 246, 0.8)' : 'rgba(255, 255, 255, 0.9)', 
                marginRight: 8,
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
              }}
              disabled={loading || contactFormSubmitted || startHereSubmitted || calculatorSubmitted}
              maxLength={500}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim() || contactFormSubmitted || startHereSubmitted || calculatorSubmitted} 
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                padding: '0 22px', 
                fontSize: 18, 
                cursor: 'pointer', 
                borderRadius: 12, 
                fontWeight: 700, 
                height: 44,
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              ➤
            </button>
            <button 
              type="button" 
              onClick={() => setShowContactForm(true)}
              disabled={contactFormSubmitted || startHereSubmitted || calculatorSubmitted}
              style={{ 
                background: contactFormSubmitted || startHereSubmitted || calculatorSubmitted ? 'rgba(148, 163, 184, 0.5)' : '#22c55e', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                padding: '0 12px', 
                fontSize: 16, 
                cursor: 'pointer', 
                borderRadius: 12, 
                fontWeight: 600, 
                height: 44, 
                marginLeft: 8,
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              title="Kontakt oss"
            >
              📞
            </button>
          </form>
        </div>
      )}
    </>
  );
} 