import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// AI Chatbot Component - Premium & Professional
const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! Welcome to Inventory PRO - I\'m your AI Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Predefined responses for common queries
  const getAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Product-related queries
    if (lowerQuery.includes('product') || lowerQuery.includes('inventory')) {
      return "I can help you manage products! You can add new products, update quantities, track stock levels, and organize items by categories. Navigate to the Products page to get started.";
    }
    
    // Billing/Invoice queries
    if (lowerQuery.includes('bill') || lowerQuery.includes('invoice') || lowerQuery.includes('payment')) {
      return "For billing and invoices, you can access the Billing section to create new invoices, view payment history, and manage transactions. The system tracks all your billing activities.";
    }
    
    // Customer queries
    if (lowerQuery.includes('customer') || lowerQuery.includes('client')) {
      return "Customer management is available in the Customers section. You can add, edit, and manage customer information, view their purchase history, and track their activities.";
    }
    
    // Employee queries
    if (lowerQuery.includes('employee') || lowerQuery.includes('staff')) {
      return "Employee management allows you to add team members, assign roles, and manage their permissions. Contact your administrator for access to employee management features.";
    }
    
    // Refund queries
    if (lowerQuery.includes('refund') || lowerQuery.includes('return')) {
      return "To request a refund, go to the Refund Requests section. You can submit return requests and track their status. Our team will review your request promptly.";
    }
    
    // Report/Analytics queries
    if (lowerQuery.includes('report') || lowerQuery.includes('analytics') || lowerQuery.includes('statistic')) {
      return "Reports and analytics provide insights into your business performance. You can view sales reports, inventory status, and other key metrics in the Reports section.";
    }
    
    // How to use / Help
    if (lowerQuery.includes('how') || lowerQuery.includes('help') || lowerQuery.includes('guide')) {
      return "This inventory management system helps you track products, manage customers, handle billing, and more. Use the sidebar to navigate between different sections. Need help with a specific feature?";
    }
    
    // Login/Access issues
    if (lowerQuery.includes('login') || lowerQuery.includes('password') || lowerQuery.includes('access')) {
      return "For login issues, please contact your administrator. They can help reset your password or manage your account access permissions.";
    }
    
    // Subscription/Billing plans
    if (lowerQuery.includes('subscription') || lowerQuery.includes('plan') || lowerQuery.includes('upgrade')) {
      return "You can manage your subscription plan in the Billing section. Contact your administrator to upgrade or modify your plan.";
    }
    
    // Greeting
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return "Hello! How can I assist you today? I can help with products, billing, customers, reports, and more.";
    }
    
    // Thank you
    if (lowerQuery.includes('thank') || lowerQuery.includes('thanks')) {
      return "You're welcome! If you have any more questions, feel free to ask. I'm here to help!";
    }
    
    // Default response
    return "Thank you for your question! I'm here to help with this inventory management system. I can assist with products, billing, customers, reports, refunds, and general usage. What would you like to know more about?";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Chat Toggle Button - Premium Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 flex items-center justify-center group ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open AI Assistant"
      >
       <img src="https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif" alt="AI Assistant" className="w-full h-full rounded-full" />
        {/* Animated notification dot */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window - Premium Design */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-slideUp">
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg> */}
                <img src="https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif" alt="AI Assistant" className="w-10 h-10 rounded-full" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-600"></span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">AI Assistant</h3>
                <p className="text-primary-100 text-xs">Online • Always ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-600'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span
                    className={`text-[10px] mt-1 block ${
                      message.type === 'user' ? 'text-primary-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2 overflow-x-auto shrink-0">
            {['Products', 'Billing', 'Help', 'Reports'].map((action) => (
              <button
                key={action}
                onClick={() => setInputMessage(`Tell me about ${action.toLowerCase()}`)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors whitespace-nowrap"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;

