import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Calculator, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  Bot, 
  User,
  Compass,
  Leaf,
  Calendar,
  Building2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; action: () => void; isPrimary?: boolean }[];
  link?: { text: string; url: string };
  isLeadForm?: boolean;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Namaste! 👋 Welcome to Anvitam. I'm Archana's AI Assistant. How can I help bring your eco-resort, farmhouse, or permaculture vision to life today?",
      options: [
        { 
          label: '🌾 Calculate Project Cost', 
          action: () => triggerEstimator(),
          isPrimary: true 
        },
        { 
          label: '🏫 Book Campus Workshop', 
          action: () => handleQuickSelect("Tell me about Nest N Nurture workshops for schools and offices.") 
        },
        { 
          label: '🌿 Eco-Resort & Farmhouse Services', 
          action: () => handleQuickSelect("What services do you offer for farmhouses and eco-resorts?") 
        },
        { 
          label: '📞 Book 1:1 Consultation', 
          action: () => handleQuickSelect("How can I book a 1:1 consultation with Architect Archana Gavas?") 
        }
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', contact: '', interest: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentCtx = useContent();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const triggerEstimator = () => {
    window.dispatchEvent(new CustomEvent('open-estimator'));
    addBotResponse("I've launched our interactive Cost Estimator tool for you! You can calculate exact budget estimates for Food Forests, Farmhouses, and Eco-Resorts right here on screen.");
  };

  const handleQuickSelect = (queryText: string) => {
    handleUserSend(queryText);
  };

  const saveLeadToDatabase = async (name: string, contact: string, details: string) => {
    try {
      const formattedMsg = `[AI CHATBOT LIVE LEAD]
Name: ${name}
Contact Info (Email/WhatsApp): ${contact}
User Interest / Query: ${details}
Timestamp: ${new Date().toLocaleString()}`;

      if (contentCtx?.addMessage) {
        await contentCtx.addMessage({
          id: `lead-chat-${Date.now()}`,
          name: name || 'AI Chatbot Visitor',
          email: contact.includes('@') ? contact : 'no-email@chatlead.com',
          message: formattedMsg,
          date: new Date().toISOString()
        });
      }
      setLeadCaptured(true);
    } catch (err) {
      console.error('Failed to save chatbot lead:', err);
    }
  };

  const generateBotReply = (userQuery: string): { text: string; options?: Message['options']; link?: Message['link']; isLeadForm?: boolean } => {
    const q = userQuery.toLowerCase();

    // 1. COST / ESTIMATE / PRICE
    if (q.includes('cost') || q.includes('price') || q.includes('estimate') || q.includes('budget') || q.includes('charge') || q.includes('fee')) {
      return {
        text: "Our design pricing varies by land area and scope. You can generate an instant, itemized estimate using our live Cost Estimator tool!",
        options: [
          { label: '📊 Open Live Cost Estimator', action: () => triggerEstimator(), isPrimary: true },
          { label: '🌿 Explore All Services', action: () => navigate('/services') },
          { label: '📞 Book 1:1 Consultation', action: () => window.open('https://topmate.io/archanagavas/1799075', '_blank') }
        ]
      };
    }

    // 2. WORKSHOPS / SCHOOLS / COLLEGES / OFFICES
    if (q.includes('workshop') || q.includes('school') || q.includes('college') || q.includes('office') || q.includes('nest') || q.includes('bird house') || q.includes('campus')) {
      return {
        text: "Our Nest N Nurture initiative conducts hands-on workshops for schools, colleges, and corporate offices! Offerings include Bird House Making, Space Makeovers, Upcycling, and Plastic Waste Transformation.",
        options: [
          { label: '🏫 View Workshops Page', action: () => navigate('/workshops') },
          { label: '📝 Request Workshop Proposal', action: () => promptLeadCapture("Nest N Nurture Campus Workshop") },
          { label: '📊 Estimate Workshop Budget', action: () => triggerEstimator() }
        ]
      };
    }

    // 3. CONSULTATION / BOOK / APPOINTMENT / TALK / CALL
    if (q.includes('consult') || q.includes('book') || q.includes('talk') || q.includes('meet') || q.includes('call') || q.includes('appointment')) {
      return {
        text: "Architect Archana Gavas offers direct 1:1 online consultations for land masterplanning, resort strategy, and sustainable home building.",
        options: [
          { label: '📅 Book 1:1 Call via Topmate', action: () => window.open('https://topmate.io/archanagavas/1799075', '_blank'), isPrimary: true },
          { label: '📩 Leave Callback Details', action: () => promptLeadCapture("1:1 Consultation Booking") }
        ],
        link: { text: "Book directly on Topmate →", url: "https://topmate.io/archanagavas/1799075" }
      };
    }

    // 4. FARMHOUSE / ECO RESORT / PERMACULTURE
    if (q.includes('farm') || q.includes('resort') || q.includes('land') || q.includes('forest') || q.includes('permaculture') || q.includes('garden') || q.includes('masterplan')) {
      return {
        text: "We specialize in end-to-end master planning for eco-resorts, bio-climatic farmhouses, and food forest restoration across India and worldwide. We integrate natural building materials with rainwater harvesting.",
        options: [
          { label: '🌾 View Portfolio Projects', action: () => navigate('/projects') },
          { label: '📊 Calculate Land Estimate', action: () => triggerEstimator(), isPrimary: true },
          { label: '📩 Request Project Callback', action: () => promptLeadCapture("Farmhouse / Eco-Resort Inquiry") }
        ]
      };
    }

    // 5. SHOP / DIGITAL PRODUCTS / TEMPLATES
    if (q.includes('shop') || q.includes('buy') || q.includes('kit') || q.includes('template') || q.includes('ebook') || q.includes('digital')) {
      return {
        text: "Explore our digital toolkits, DIY bird house blueprints, and permaculture design templates in the Anvitam Shop!",
        options: [
          { label: '🛍️ Visit Anvitam Shop', action: () => navigate('/shop'), isPrimary: true }
        ]
      };
    }

    // 6. CONTACT / LOCATION / EMAIL / PHONE
    if (q.includes('contact') || q.includes('location') || q.includes('address') || q.includes('phone') || q.includes('email') || q.includes('nadiad') || q.includes('vadodara')) {
      return {
        text: "📍 Our studio is located in Nadiad, Gujarat, India (serving clients worldwide).\n📧 Email: ar.archanagavas@gmail.com\n📞 Phone: +91 7990657190",
        options: [
          { label: '📩 Send Studio Inquiry', action: () => promptLeadCapture("General Contact Inquiry") },
          { label: '🗺️ Open Contact Page', action: () => navigate('/contact') }
        ]
      };
    }

    // DEFAULT FALLBACK
    return {
      text: `I'd love to help you with "${userQuery}". Would you like to estimate your project budget, explore our services, or leave your phone/email for Archana to get back to you?`,
      options: [
        { label: '📊 Calculate Project Cost', action: () => triggerEstimator(), isPrimary: true },
        { label: '📩 Request Quick Callback', action: () => promptLeadCapture(userQuery) },
        { label: '🌿 Browse Services', action: () => navigate('/services') }
      ]
    };
  };

  const promptLeadCapture = (interestTopic: string) => {
    setLeadData(prev => ({ ...prev, interest: interestTopic }));
    setMessages(prev => [
      ...prev,
      {
        id: `lead-prompt-${Date.now()}`,
        sender: 'bot',
        text: `Great! Please leave your Name and WhatsApp number / Email below so Archana's team can send you full details regarding "${interestTopic}".`,
        isLeadForm: true
      }
    ]);
  };

  const addBotResponse = (text: string, options?: Message['options'], link?: Message['link']) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text,
          options,
          link
        }
      ]);
    }, 600);
  };

  const handleUserSend = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate response
    const botReply = generateBotReply(text);
    addBotResponse(botReply.text, botReply.options, botReply.link);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name.trim() || !leadData.contact.trim()) return;

    saveLeadToDatabase(leadData.name, leadData.contact, leadData.interest || 'Chatbot Callback Request');
    
    setMessages(prev => [
      ...prev,
      {
        id: `lead-confirm-${Date.now()}`,
        sender: 'bot',
        text: `Thank you ${leadData.name}! 🎉 We've received your request. Architect Archana Gavas or our team will get in touch with you shortly.`,
        options: [
          { label: '🌾 Explore Projects', action: () => navigate('/projects') },
          { label: '📊 Open Cost Estimator', action: () => triggerEstimator(), isPrimary: true }
        ]
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none font-sans">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-stone-900 text-white shadow-2xl border border-emerald-500/30 cursor-pointer group hover:bg-emerald-950 transition-all duration-300"
            aria-label="Open AI Assistant Chat"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-[#CCFF00] border border-[#CCFF00]/40">
                <Sparkles size={16} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#CCFF00] rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#CCFF00] rounded-full" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold tracking-wide text-white group-hover:text-[#CCFF00] transition-colors">
                Anvitam AI
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Ask &amp; Estimate</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Drawer Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] bg-[#FBF9F4] rounded-3xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden relative"
          >
            {/* Header Bar */}
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/archana.png" 
                    alt="Archana Gavas AI" 
                    className="w-9 h-9 rounded-full object-cover border border-[#CCFF00]" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#CCFF00] rounded-full border-2 border-stone-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Archana's AI Assistant</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-900 text-[#CCFF00] text-[9px] uppercase tracking-wider font-extrabold">Online</span>
                  </h3>
                  <p className="text-[10px] text-stone-400">Regenerative Design &amp; Cost Guide</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={triggerEstimator}
                  title="Open Cost Estimator"
                  className="p-1.5 rounded-full hover:bg-stone-800 text-[#CCFF00] transition-colors cursor-pointer"
                >
                  <Calculator size={17} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body — Scrollable Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#FBF9F4]">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col space-y-1.5",
                    msg.sender === 'user' ? "items-end" : "items-start"
                  )}
                >
                  {/* Sender Label */}
                  <div className="flex items-center gap-1 text-[9px] text-stone-400 px-1">
                    {msg.sender === 'bot' ? (
                      <>
                        <Bot size={11} className="text-emerald-700" />
                        <span>Anvitam Bot</span>
                      </>
                    ) : (
                      <>
                        <User size={11} className="text-stone-600" />
                        <span>You</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line shadow-xs",
                      msg.sender === 'user' 
                        ? "bg-emerald-950 text-white rounded-br-none" 
                        : "bg-white text-stone-900 border border-stone-200/80 rounded-bl-none"
                    )}
                  >
                    {msg.text}

                    {/* External Link */}
                    {msg.link && (
                      <div className="mt-2 pt-2 border-t border-stone-200">
                        <a 
                          href={msg.link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:underline"
                        >
                          <span>{msg.link.text}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Inline Lead Capture Form */}
                  {msg.isLeadForm && !leadCaptured && (
                    <form 
                      onSubmit={handleLeadSubmit}
                      className="mt-2 p-3 rounded-xl bg-white border border-emerald-300 shadow-md w-full max-w-[90%] space-y-2"
                    >
                      <p className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                        <Phone size={12} className="text-emerald-700" /> Request Direct Callback / Info:
                      </p>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={leadData.name}
                        onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:border-emerald-800"
                      />
                      <input
                        type="text"
                        required
                        placeholder="WhatsApp No. or Email"
                        value={leadData.contact}
                        onChange={(e) => setLeadData({ ...leadData, contact: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:border-emerald-800"
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-emerald-950 text-[#CCFF00] rounded-lg text-xs font-bold hover:bg-black transition-colors"
                      >
                        Submit Lead Request →
                      </button>
                    </form>
                  )}

                  {/* Quick Action Chips */}
                  {msg.options && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[95%]">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={opt.action}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-2xs border flex items-center gap-1",
                            opt.isPrimary 
                              ? "bg-emerald-950 text-[#CCFF00] border-emerald-900 hover:bg-black" 
                              : "bg-white text-stone-800 border-stone-300 hover:bg-stone-100 hover:border-stone-400"
                          )}
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-stone-200 w-max text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Estimator Bar */}
            <div className="bg-stone-100 px-3 py-1.5 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-600">
              <span className="flex items-center gap-1 font-semibold">
                <Leaf size={11} className="text-emerald-700" /> Need instant pricing?
              </span>
              <button 
                onClick={triggerEstimator}
                className="text-emerald-950 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Calculate Cost</span>
                <ArrowRight size={10} />
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white border-t border-stone-200 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUserSend();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about cost, workshops, projects..."
                  className="flex-1 bg-stone-100 border border-stone-200 rounded-full px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-800 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-full bg-emerald-950 text-[#CCFF00] hover:bg-black disabled:opacity-40 disabled:hover:bg-emerald-950 flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIChatWidget;
