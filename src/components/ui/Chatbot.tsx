"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatbotProps {
    is3D?: boolean;
    className?: string;
}

export default function Chatbot({ is3D = false, className = "" }: ChatbotProps) {
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
        { text: "Hello! How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false); // Closed by default
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages(prev => [...prev, { text: input, isBot: false }]);
        setInput("");

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "Thank you for reaching out. We will get back to you shortly!", isBot: true }]);
        }, 1000);
    };

    if (!isOpen && !is3D) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center justify-center w-14 h-14 bg-primary text-black rounded-full shadow-lg hover:scale-110 transition-transform ${className}`}
            >
                <Bot size={24} />
            </button>
        );
    }

    return (
        <div className={`flex flex-col bg-black border border-primary/30 overflow-hidden ${is3D ? 'w-full h-full' : 'w-80 h-96 rounded-xl shadow-2xl'} ${className}`}>
            {/* Header */}
            <div className="bg-primary/20 p-3 flex justify-between items-center border-b border-primary/20">
                <div className="flex items-center gap-2">
                    <Bot size={18} className="text-primary" />
                    <span className="font-mono text-xs text-primary font-bold">REVIL ASSIST</span>
                </div>
                {!is3D && (
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-2 rounded-lg text-xs ${msg.isBot
                            ? 'bg-zinc-800 text-gray-200 rounded-tl-none'
                            : 'bg-primary/20 text-primary-foreground rounded-tr-none border border-primary/20'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2 border-t border-primary/20 bg-black/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-xs text-white placeholder-gray-500 focus:ring-0 outline-none"
                    />
                    <button type="submit" className="text-primary hover:text-white transition-colors">
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
}
