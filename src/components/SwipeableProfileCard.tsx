import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, GraduationCap, Briefcase, User, Info } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';
import { hapticLight, hapticMedium, hapticSuccess, hapticImpact } from '@/utils/haptics';

interface SwipeableProfileCardProps {
  profile: {
    user_id: string;
    age: number;
    city_only: string;
    education_level: string;
    profession_category: string;
    interests: string[];
    looking_for: string;
    avatar_url: string;
    verification_score: number;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDoubleTap?: () => void;
}

export const SwipeableProfileCard = ({ 
  profile, 
  onSwipeLeft, 
  onSwipeRight,
  onDoubleTap 
}: SwipeableProfileCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const ROTATION_MULTIPLIER = 0.03;

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPosition({ x: clientX, y: clientY });
    hapticLight(); // Light vibration on touch start
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startPosition.x;
    const deltaY = clientY - startPosition.y;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Check if swipe threshold is met
    if (Math.abs(position.x) > SWIPE_THRESHOLD) {
      // Haptic feedback for successful swipe
      if (position.x > 0) {
        hapticSuccess(); // Success pattern for like
      } else {
        hapticMedium(); // Medium vibration for pass
      }
      
      // Animate out
      setIsAnimatingOut(true);
      const direction = position.x > 0 ? 1 : -1;
      setPosition({ x: direction * window.innerWidth, y: position.y });
      
      // Trigger callback after animation
      setTimeout(() => {
        if (direction > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
        setIsAnimatingOut(false);
        setPosition({ x: 0, y: 0 });
      }, 200);
    } else {
      // Light haptic for return to center
      if (Math.abs(position.x) > 20) {
        hapticLight();
      }
      // Return to center
      setPosition({ x: 0, y: 0 });
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    handleStart(touch.clientX, touch.clientY);
    
    // Double tap detection with haptic
    const now = Date.now();
    if (now - lastTap < 300 && onDoubleTap) {
      hapticMedium(); // Haptic for double tap
      onDoubleTap();
    }
    setLastTap(now);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Button handlers
  const handleLikeButton = () => {
    if (isAnimatingOut) return;
    hapticSuccess(); // Success haptic for like button
    setIsAnimatingOut(true);
    setPosition({ x: window.innerWidth, y: 0 });
    setTimeout(() => {
      onSwipeRight();
      setIsAnimatingOut(false);
      setPosition({ x: 0, y: 0 });
    }, 200);
  };

  const handlePassButton = () => {
    if (isAnimatingOut) return;
    hapticMedium(); // Medium haptic for pass button
    setIsAnimatingOut(true);
    setPosition({ x: -window.innerWidth, y: 0 });
    setTimeout(() => {
      onSwipeLeft();
      setIsAnimatingOut(false);
      setPosition({ x: 0, y: 0 });
    }, 200);
  };

  const handleInfoButton = () => {
    hapticLight(); // Light haptic for info button
    if (onDoubleTap) {
      onDoubleTap();
    }
  };

  const rotation = position.x * ROTATION_MULTIPLIER;
  const likeOpacity = Math.max(0, Math.min(1, position.x / SWIPE_THRESHOLD));
  const nopeOpacity = Math.max(0, Math.min(1, -position.x / SWIPE_THRESHOLD));

  return (
    <div className="relative w-full h-full select-none">
      <Card
        ref={cardRef}
        className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
          isAnimatingOut ? 'transition-all duration-300 ease-out' : ''
        }`}
        style={{
          transform: `translateX(${position.x}px) translateY(${position.y}px) rotate(${rotation}deg)`,
          transition: isDragging || isAnimatingOut ? 'none' : 'all 0.3s ease-out',
          touchAction: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CardContent className="p-0 h-full relative overflow-hidden">
          {/* Swipe Indicators */}
          <div 
            className="absolute top-8 left-8 z-10 pointer-events-none transition-opacity duration-200"
            style={{ opacity: likeOpacity }}
          >
            <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg border-4 border-green-500 transform rotate-12 shadow-lg">
              <Heart className="h-6 w-6 fill-current" />
              <span className="font-bold text-xl">J'AIME</span>
            </div>
          </div>

          <div 
            className="absolute top-8 right-8 z-10 pointer-events-none transition-opacity duration-200"
            style={{ opacity: nopeOpacity }}
          >
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg border-4 border-red-500 transform -rotate-12 shadow-lg">
              <X className="h-6 w-6" />
              <span className="font-bold text-xl">PASSER</span>
            </div>
          </div>

          {/* Profile Image */}
          <div className="relative h-96 bg-gradient-to-br from-muted to-muted/50">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Photo de profil" 
                className="w-full h-full object-cover"
                draggable="false"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Verification Badge */}
            <div className="absolute top-4 left-4">
              <VerificationBadge verificationScore={profile.verification_score} />
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4 bg-background">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">Profil Anonyme</h3>
              <span className="text-xl text-muted-foreground">{profile.age} ans</span>
            </div>

            <div className="space-y-2">
              {profile.city_only && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{profile.city_only}</span>
                </div>
              )}
              
              {profile.education_level && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{profile.education_level}</span>
                </div>
              )}
              
              {profile.profession_category && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{profile.profession_category}</span>
                </div>
              )}
            </div>

            {profile.looking_for && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {profile.looking_for}
              </p>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 5).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.interests.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        {/* Pass Button */}
        <Button
          onClick={handlePassButton}
          disabled={isAnimatingOut}
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
        >
          <X className="h-7 w-7" />
        </Button>

        {/* Info Button */}
        {onDoubleTap && (
          <Button
            onClick={handleInfoButton}
            disabled={isAnimatingOut}
            size="lg"
            variant="outline"
            className="h-12 w-12 rounded-full border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
          >
            <Info className="h-5 w-5" />
          </Button>
        )}

        {/* Like Button */}
        <Button
          onClick={handleLikeButton}
          disabled={isAnimatingOut}
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
        >
          <Heart className="h-7 w-7" />
        </Button>
      </div>

      {/* Swipe Instructions (shown initially) */}
      {!isDragging && position.x === 0 && !isAnimatingOut && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in">
          <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-muted-foreground border shadow-sm">
            👆 Glissez ou utilisez les boutons
          </div>
        </div>
      )}
    </div>
  );
};
