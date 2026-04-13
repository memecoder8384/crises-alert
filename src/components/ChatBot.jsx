import React, { useState, useEffect, useRef } from 'react';
import { generateResponse } from '../services/gemini';
import { useAuth } from '../features/auth/AuthContext';

const ChatBot = () => {
  const { currentUser, userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am Gemini. I can assist you with your queries today.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [cache, setCache] = useState({});
  const requestHistory = useRef([]);
  const messagesEndRef = useRef(null);

  // Cooldown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (userRole) {
      setMessages([{ sender: 'ai', text: `System authorized for clear ${userRole.toUpperCase()} level access. How can I assist your operations today?` }]);
      setIsOpen(false);
    }
  }, [userRole]);

  if (!currentUser) return null;

  const handleSend = async () => {
    const cleanInput = input.trim();
    if (!cleanInput || isTyping || cooldown > 0) return;
    if (cleanInput.length > 200) return;
    
    // Check Cache First
    if (cache[cleanInput]) {
      setMessages(prev => [...prev, { sender: 'user', text: cleanInput }]);
      setMessages(prev => [...prev, { sender: 'ai', text: cache[cleanInput] }]);
      setInput('');
      return;
    }
    
    const now = Date.now();
    const ONE_MINUTE = 60 * 1000;
    
    // Purge timestamps older than 1 minute
    requestHistory.current = requestHistory.current.filter(time => now - time < ONE_MINUTE);
    
    if (requestHistory.current.length >= 5) {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Too many requests, try later',
        isWarning: true
      }]);
      return;
    }
    
    // Log the valid request and trigger tactical cooldown
    requestHistory.current.push(now);
    setCooldown(3);
    
    const userPrompt = cleanInput;
    
    // Dynamically scrape the user's active viewport text
    const activeRoute = window.location.pathname;
    const visibleText = document.body.innerText.replace(/\s+/g, ' ').substring(0, 4000);
    const contextualPrompt = `[UI Context: You are seeing what the user sees. The user is currently on route "${activeRoute}". The visible text on their active webpage reads: "${visibleText}"]\n\nUser Question: ${userPrompt}`;

    setMessages(prev => [...prev, { sender: 'user', text: userPrompt }]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await generateResponse(contextualPrompt);
      const finalResponse = responseText.length > 300 ? responseText.substring(0, 300) + '...' : responseText;
      
      setCache(prev => ({ ...prev, [userPrompt]: finalResponse }));
      setMessages(prev => [...prev, { sender: 'ai', text: finalResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Please follow basic safety measures and contact emergency services.", isWarning: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-[340px] sm:w-[380px] h-[520px] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 border-t-4 border-t-primary">
          <div className="bg-primary px-4 py-3.5 flex justify-between items-center shadow-md z-10 relative">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                 <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
               </div>
               <div>
                  <h3 className="font-headline font-bold text-white leading-tight text-sm">Rescue Support</h3>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                     API Link Active
                  </span>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                   <span className={`material-symbols-outlined text-[16px] mr-2 self-end mb-1 ${msg.isWarning ? 'text-amber-500' : 'text-primary'}`}>
                     {msg.isWarning ? 'warning' : 'auto_awesome'}
                   </span>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : msg.isWarning ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700 rounded-bl-sm font-semibold' : 'bg-surface-container-lowest border border-outline-variant/10 text-on-surface rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <span className="material-symbols-outlined text-primary text-[16px] mr-2 self-end mb-1">auto_awesome</span>
                <div className="bg-surface-container-lowest border border-outline-variant/10 text-secondary rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm shadow-sm flex items-center">
                  Loading...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-surface-container border-t border-surface shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex bg-surface-container-lowest rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 border border-outline-variant/20 focus-within:border-primary/40 transition-all shadow-inner">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Gemini..."
                maxLength={200}
                className="flex-1 bg-transparent border-none px-4 py-3 outline-none text-sm text-on-surface"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping || cooldown > 0}
                className="px-4 text-primary disabled:opacity-50 hover:bg-primary/5 transition-colors flex items-center justify-center cursor-pointer font-bold text-xs w-24"
              >
                {cooldown > 0 ? (
                  <span className="flex items-center justify-center w-full gap-1 text-secondary uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] animate-spin" style={{ animationDuration: '3s' }}>hourglass_empty</span>
                    Wait {cooldown}s
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[22px]">send</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 ${isOpen ? 'bg-surface-container text-secondary border-surface-container' : 'bg-primary text-on-primary border-primary shadow-primary/30 hover:bg-primary/90'}`}
      >
        <span className="material-symbols-outlined text-[32px]">{isOpen ? 'close' : 'smart_toy'}</span>
      </button>
    </div>
  );
};

export default ChatBot;
