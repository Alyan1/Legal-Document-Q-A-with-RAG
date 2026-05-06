import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';
import { Toaster, toast } from 'sonner';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('All Documents');
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        toast.error('Failed to fetch documents.');
      }
    } catch (error) {
      toast.error('Backend not connected.');
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans overflow-hidden">
      {/* Toast notifications provider */}
      <Toaster theme="dark" position="bottom-right" />
      
      {/* Sidebar Component */}
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
        fetchDocuments={fetchDocuments}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Chat Component */}
      <MainChat
        messages={messages}
        setMessages={setMessages}
        selectedDoc={selectedDoc}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  );
}

export default App;
