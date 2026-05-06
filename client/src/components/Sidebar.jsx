import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Trash2, Library, Loader2, Menu } from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar({
  documents,
  selectedDoc,
  setSelectedDoc,
  fetchDocuments,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'File uploaded successfully!');
        await fetchDocuments();
        // Optional: auto-select the newly uploaded file
        // setSelectedDoc(file.name);
      } else {
        toast.error(data.detail || 'Failed to upload document.');
      }
    } catch (error) {
      toast.error('Backend not connected or network error.');
    } finally {
      setIsUploading(false);
    }
  }, [fetchDocuments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleDelete = async () => {
    if (selectedDoc === 'All Documents') return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/documents/${selectedDoc}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`Deleted ${selectedDoc}`);
        setSelectedDoc('All Documents');
        await fetchDocuments();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to delete document.');
      }
    } catch (error) {
      toast.error('Backend not connected or network error.');
    }
  };

  const sidebarClass = isSidebarOpen
    ? 'translate-x-0'
    : '-translate-x-full md:translate-x-0'; // Hidden on mobile unless open, always visible on desktop

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ease-in-out ${sidebarClass} md:relative md:translate-x-0`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-lg">
            <Library className="h-5 w-5 text-indigo-400" />
            Legal Document Q&A
          </div>
          <button 
            className="md:hidden text-zinc-400 hover:text-zinc-100"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          
          {/* Upload Zone */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Upload Document
            </h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-2" />
              ) : (
                <UploadCloud className="h-8 w-8 text-zinc-400 mb-2" />
              )}
              <p className="text-sm text-zinc-300">
                {isUploading ? 'Uploading...' : isDragActive ? 'Drop PDF here' : 'Drag & drop PDF, or click to select'}
              </p>
            </div>
          </div>

          {/* Document Context Selection */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Document Context
            </h3>
            <div className="relative">
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full appearance-none bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="All Documents">All Documents</option>
                {documents.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {selectedDoc !== 'All Documents' && (
              <button
                onClick={handleDelete}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete {selectedDoc}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
