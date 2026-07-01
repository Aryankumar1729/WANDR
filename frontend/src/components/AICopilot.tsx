"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTripData } from '@/context/TripContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Wandr AI Copilot. I can help you customize your trip or answer any questions about the destinations." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { tripData } = useTripData();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Pass the current trip context as part of the initial hidden prompt, or just the history
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg + (tripData ? `\n\n[Context: User is planning a trip to ${tripData.destination || 'somewhere'}]` : ''),
          conversation_history: newMessages.slice(0, -1)
        })
      });

      if (!response.ok) throw new Error("Failed to chat");

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the network right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-surface-container-lowest border border-outline rounded-3xl shadow-2xl mb-4 w-[360px] h-[500px] flex flex-col overflow-hidden animate-slide-up transform origin-bottom-right transition-all">
          
          {/* Header */}
          <div className="bg-primary text-on-primary px-6 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl animate-float">smart_toy</span>
              <div>
                <h3 className="font-bold tracking-wide">Wandr Copilot</h3>
                <p className="text-xs text-on-primary/80">Always here to help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-on-primary/80 hover:text-on-primary hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-surface/30">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-sm' 
                      : 'bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/30'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container text-on-surface rounded-2xl rounded-tl-sm px-4 py-3 border border-outline-variant/30 shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 bg-surface-container-lowest border-t border-outline-variant/50 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your trip..."
                className="w-full bg-surface-container border border-outline-variant rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow text-on-surface placeholder:text-on-surface-variant/60"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors flex items-center justify-center shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-primary text-on-primary w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'}`}
      >
        <span className="material-symbols-outlined text-3xl">auto_awesome</span>
      </button>
    </div>
  );
}
