
export interface DocumentVerification {
  id: string;
  user_id: string;
  document_type: 'id_card' | 'passport' | 'driver_license';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  created_at: string;
}

export interface PhotoBlurSettings {
  blur_profile_picture: boolean;
  blur_gallery_photos: boolean;
  blur_until_approved: boolean;
  blur_for_non_matches: boolean;
}
