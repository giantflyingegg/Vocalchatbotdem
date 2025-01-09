import { useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';

interface Message {
  role: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleRecordingComplete = (userMessage: Message, assistantMessage: Message) => {
    setMessages(prev => [...prev, userMessage, assistantMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto max-w-4xl p-4">
        <div className="bg-navy-900 bg-[#0a192f] rounded-lg shadow-xl shadow-black/20">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-semibold text-cyan-400">Kierans Voice Chat Assistant</h1>
          </div>
          
          <div className="flex flex-col h-[600px]">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-800 text-cyan-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Recorder Section */}
            <div className="p-4 border-t border-gray-800">
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-cyan-400">
          <p>Click the button and speak for 5 seconds to send a message</p>
        </div>
      </div>
    </div>
  );
}