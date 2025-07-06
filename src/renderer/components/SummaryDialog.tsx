import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { Toast } from './ui/Toast';

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  projectPath: string;
}

export function SummaryDialog({ isOpen, onClose, sessionId, projectPath }: SummaryDialogProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'markdown'>('summary');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['summary', sessionId, projectPath],
    queryFn: () => window.api.generateSummary(sessionId, projectPath),
    enabled: isOpen && !!sessionId && !!projectPath,
    retry: 1,
  });

  const handleCopyMarkdown = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary.markdown);
      setToastMessage('Summary copied to clipboard!');
      setShowToast(true);
    } catch (error) {
      console.error('Copy failed:', error);
      setToastMessage('Failed to copy to clipboard');
      setShowToast(true);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-card border border-border rounded-lg shadow-soft overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4 bg-card shadow-subtle">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                Conversation Summary
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Intelligent analysis of your Claude Code session
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-md p-2 hover:bg-muted transition-default cursor-pointer">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Tab Navigation */}
          {summary && (
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-default cursor-pointer ${
                    activeTab === 'summary'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-default cursor-pointer ${
                    activeTab === 'markdown'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                  }`}
                >
                  Markdown
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Generating summary...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-destructive">Failed to generate summary</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                  </p>
                </div>
              </div>
            )}

            {summary && activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Overview</h3>
                  <p className="text-sm text-muted-foreground">{summary.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Decisions */}
                  {summary.keyDecisions.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-2">Key Decisions</h3>
                      <ul className="space-y-1">
                        {summary.keyDecisions.map((decision, index) => (
                          <li key={index} className="text-sm">
                            <span className="text-accent font-medium">{index + 1}.</span> {decision}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solutions */}
                  {summary.solutions.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-2">Solutions Implemented</h3>
                      <ul className="space-y-1">
                        {summary.solutions.map((solution, index) => (
                          <li key={index} className="text-sm">
                            <span className="text-green-600 font-medium">{index + 1}.</span> {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Files Modified */}
                  {summary.filesModified.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-2">Files Modified</h3>
                      <ul className="space-y-1">
                        {summary.filesModified.map((file, index) => (
                          <li key={index} className="text-sm">
                            <code className="bg-muted/50 border border-border px-2 py-1 rounded text-xs">{file}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata */}
                  <div>
                    <h3 className="text-md font-semibold mb-2">Session Details</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Generated:</span> {new Date(summary.generatedAt).toLocaleString()}</p>
                      <p><span className="font-medium">Project:</span> {summary.projectPath.split('/').pop()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {summary && activeTab === 'markdown' && (
              <div className="h-full relative">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={handleCopyMarkdown}
                    className="rounded-md bg-card border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:shadow-subtle transition-default cursor-pointer shadow-subtle"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 border border-border p-4 rounded-lg h-full overflow-auto pr-20">
                  {summary.markdown}
                </pre>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      
      <Toast
        open={showToast}
        onOpenChange={setShowToast}
        message={toastMessage}
      />
    </Dialog.Root>
  );
}