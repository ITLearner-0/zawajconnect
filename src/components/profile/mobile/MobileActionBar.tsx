/**
 * MobileActionBar - Sticky bottom action bar for mobile devices
 * Only visible on mobile/tablet (< lg breakpoint)
 * Provides quick access to primary actions
 */

import { Heart, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseProfile } from '@/types/profile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Flag, UserX } from 'lucide-react';

interface MobileActionBarProps {
  /** Profile being viewed */
  profile: DatabaseProfile;
  /** Whether viewing own profile */
  isOwnProfile: boolean;
  /** Message button click handler */
  onMessage?: () => void;
  /** Video call button click handler */
  onVideoCall?: () => void;
  /** Share profile handler */
  onShare?: () => void;
  /** Report profile handler */
  onReport?: () => void;
  /** Block user handler */
  onBlock?: () => void;
}

const MobileActionBar = ({
  profile,
  isOwnProfile,
  onMessage,
  onVideoCall,
  onShare,
  onReport,
  onBlock,
}: MobileActionBarProps) => {
  // Don't show action bar for own profile
  if (isOwnProfile) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-50 safe-area-inset-bottom">
      <div className="flex gap-2 max-w-screen-sm mx-auto">
        {/* Primary Action - Message */}
        <Button
          onClick={onMessage}
          className="flex-1 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 transition-colors touch-manipulation"
          size="lg"
        >
          <Heart className="h-5 w-5 mr-2" />
          <span className="font-medium">Message</span>
        </Button>

        {/* Secondary Action - Video Call */}
        <Button
          onClick={onVideoCall}
          variant="outline"
          className="flex-1 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation border-2"
          size="lg"
        >
          <Video className="h-5 w-5 mr-2" />
          <span className="font-medium">Appel</span>
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation border-2"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onShare && (
              <DropdownMenuItem onClick={onShare} className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Partager le profil
              </DropdownMenuItem>
            )}
            {onReport && (
              <DropdownMenuItem onClick={onReport} className="cursor-pointer">
                <Flag className="h-4 w-4 mr-2" />
                Signaler
              </DropdownMenuItem>
            )}
            {onBlock && (
              <DropdownMenuItem
                onClick={onBlock}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <UserX className="h-4 w-4 mr-2" />
                Bloquer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileActionBar;
