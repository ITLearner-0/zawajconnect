import React from 'react';
import { Link } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import { Button } from '@/components/ui/button';
import AccessibilityControls from '@/components/AccessibilityControls';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Settings, Home, ArrowLeft, ShieldCheck } from 'lucide-react';
import { VerificationStatus } from '@/types/profile';

interface ProfileHeaderProps {
  userEmail?: string | null;
  userId?: string | null;
  hasCompatibilityResults?: boolean;
  onSignOut: () => void | Promise<void>;
  verificationStatus?: VerificationStatus;
  waliActive?: boolean;
  fullName?: string;
}

const ProfileHeader = ({
  userEmail,
  userId,
  hasCompatibilityResults,
  onSignOut,
  verificationStatus,
  waliActive = false,
  fullName,
}: ProfileHeaderProps) => {
  const verificationPct = verificationStatus
    ? Math.round(
        ([verificationStatus.email, verificationStatus.phone, verificationStatus.id, verificationStatus.wali]
          .filter(Boolean).length / 4) * 100
      )
    : 0;
  return (
    <IslamicPattern
      variant="background"
      intensity="light"
      className="mb-6 rounded-lg bg-islamic-cream/30 dark:bg-islamic-darkCard/30"
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <Button
            asChild
            variant="ghost"
            className="flex items-center gap-2 text-islamic-teal hover:bg-islamic-teal/10"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <AccessibilityControls />
            <CustomButton
              variant="outline"
              onClick={onSignOut}
              aria-label="Sign out of your account"
              className="flex items-center gap-2 border-islamic-teal/30 hover:bg-islamic-teal/10 dark:border-islamic-darkTeal/40 dark:hover:bg-islamic-darkTeal/20"
            >
              <LogOut className="h-4 w-4 text-islamic-burgundy dark:text-islamic-darkBrightGold" />
              Sign Out
            </CustomButton>
          </div>
        </div>

        <div className="flex items-center">
          <div className="bg-islamic-teal rounded-full p-2 mr-3 text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1
              id="profile-heading"
              className="text-2xl font-bold text-islamic-teal dark:text-islamic-cream"
            >
              Your Profile
            </h1>
            <p className="text-sm text-muted-foreground dark:text-islamic-cream/70">
              Update your information and privacy settings
              {userEmail && <span className="block text-xs opacity-75">{userEmail}</span>}
            </p>
            {verificationStatus && (
              <div className="flex gap-2 mt-1">
                <Badge
                  className={`text-xs ${
                    verificationPct >= 75
                      ? 'bg-green-600 hover:bg-green-700'
                      : verificationPct >= 50
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Profil vérifié {verificationPct}%
                </Badge>
                {waliActive && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Wali actif
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </IslamicPattern>
  );
};

export default ProfileHeader;
