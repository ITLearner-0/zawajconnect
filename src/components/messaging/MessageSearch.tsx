import { useState, useEffect } from 'react';
import { useMessageSearch, SearchResult } from '@/hooks/useMessageSearch';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Loader, Search, MessageSquare, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

interface MessageSearchProps {
  userId: string | null;
  onSelectResult: (conversationId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ userId, onSelectResult }) => {
  const [open, setOpen] = useState(false);
  const { searchTerm, setSearchTerm, searchMessages, searchResults, loading, clearSearch } =
    useMessageSearch(userId);

  // Check if this is a demo user ID
  const isDemoUser = userId?.startsWith('user-');

  // Debounce search
  useEffect(() => {
    if (isDemoUser) return; // Skip search for demo users

    const timer = setTimeout(() => {
      if (open && searchTerm.trim().length > 2) {
        searchMessages();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchMessages, open, isDemoUser]);

  const handleResultClick = (result: SearchResult) => {
    onSelectResult(result.conversationId);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      clearSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search Messages</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your messages..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground mt-1 mb-2">
          {isDemoUser
            ? 'Search not available for demo users'
            : searchTerm.length > 0 && searchTerm.length < 3
              ? 'Type at least 3 characters to search'
              : loading
                ? 'Searching...'
                : searchResults.length > 0
                  ? `Found ${searchResults.length} results`
                  : searchTerm.length >= 3
                    ? 'No matching messages found'
                    : 'Search across all your conversations'}
        </div>

        <ScrollArea className="flex-grow overflow-auto">
          {isDemoUser ? (
            <div className="flex justify-center items-center py-10">
              <MessageSquare className="mx-auto h-8 w-8 opacity-20 mb-2" />
              <p className="text-center text-muted-foreground">
                Search is not available in demo mode
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin mr-2 h-5 w-5" />
              <span>Searching messages...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.message.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      {result.otherParticipantName || 'Conversation'}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(result.message.created_at), 'PPp')}
                    </span>
                  </div>
                  <p className="text-sm">
                    {result.message.content.length > 120
                      ? `${result.message.content.substring(0, 120)}...`
                      : result.message.content}
                  </p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {result.message.sender_id === userId ? 'You' : 'Other'}
                    </Badge>
                  </div>
                </div>
              ))}

              {searchTerm.length >= 3 && searchResults.length === 0 && !loading && (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 opacity-20 mb-2" />
                  <p>No messages found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSearch;
