export interface PhotoBlurSettings {
  blur_profile_picture: boolean;
  blur_gallery_photos: boolean;
  blur_until_approved: boolean;
  blur_for_non_matches: boolean;
}

export interface DocumentVerification {
  id?: string;
  user_id: string;
  document_type: 'id_card' | 'passport' | 'driver_license' | 'birth_certificate' | 'other';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  created_at?: string;
}

export interface WaliVerification {
  id?: string;
  user_id: string;
  wali_name: string;
  wali_relationship: string;
  wali_contact: string;
  verification_method: 'phone_call' | 'video_call' | 'in_person' | 'document' | 'reference';
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  verified_at?: string;
  verified_by?: string;
  created_at?: string;
}

export interface ContentModerationFlag {
  id: string;
  content_id: string;
  content_type: 'profile' | 'message' | 'photo';
  flag_type: 'inappropriate' | 'spam' | 'harassment' | 'fake' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  flagged_by: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}
