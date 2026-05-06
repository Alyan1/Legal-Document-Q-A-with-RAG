import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, User, Bot, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { toast } from 'sonner';

export default function MainChat({
  messages,
  setMessages,
  selectedDoc,
  setIsSidebarOpen,
}) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          filename: selectedDoc,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        toast.error('Failed to get an answer.');
      }
    } catch (error) {
      toast.error('Backend not connected or network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center h-16 px-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-zinc-400 hover:text-zinc-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-3 font-semibold text-zinc-100">RAG Document Q&A</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 mt-32">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">How can I help you today?</p>
              <p className="text-sm mt-1">Select a document context from the sidebar to get started.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Bot className="h-5 w-5 text-indigo-400" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user' 
                      ? 'bg-zinc-800 text-zinc-100' 
                      : 'bg-transparent text-zinc-200'
                  }`}
                >
                  {/* Message Content */}
                  <div className={`prose prose-invert max-w-none ${msg.role === 'user' ? '' : 'prose-p:leading-relaxed'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>

                  {/* Sources Accordion */}
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <details className="mt-4 group border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
                      <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-zinc-800/80 transition-colors text-sm font-medium text-zinc-400 select-none list-none [&::-webkit-details-marker]:hidden">
                        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                        🔍 View Sources
                      </summary>
                      <div className="px-4 pb-4 pt-2 text-sm text-zinc-500 border-t border-zinc-800/50 space-y-4">
                        {msg.sources.map((source, i) => (
                          <div key={i}>
                            <span className="font-semibold text-zinc-400 block mb-1">Chunk {i + 1}:</span>
                            <p className="bg-zinc-950 p-3 rounded-md border border-zinc-800/50">{source}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-zinc-300" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Bot className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex items-center px-5 py-4 bg-transparent">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-10 pb-6 px-4 md:px-6">
        <div className="max-w-3xl mx-auto relative">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-lg"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question in '${selectedDoc}'...`}
              disabled={isLoading}
              className="flex-1 bg-transparent text-zinc-100 px-5 py-4 focus:outline-none placeholder-zinc-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 ml-0.5" />
              )}
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-zinc-500">
              AI can make mistakes. Verify important information against the sources.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
