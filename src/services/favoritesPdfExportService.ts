import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  user_id: string;
  full_name: string | null;
  age: number | null;
  location: string | null;
  bio: string | null;
  profession: string | null;
  education: string | null;
  interests: string[] | null;
}

interface NoteData {
  note: string;
  created_at: string;
  updated_at: string;
}

interface TagData {
  id: string;
  tag_name: string;
  color: string;
}

interface FavoriteExportData {
  profile: ProfileData;
  note: NoteData | null;
  tags: TagData[];
  compatibilityScore: number | null;
}

export class FavoritesPdfExportService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;
  private primaryColor: [number, number, number] = [16, 185, 129]; // Emerald
  private goldColor: [number, number, number] = [234, 179, 8]; // Gold

  constructor() {
    this.doc = new jsPDF();
  }

  private addPageIfNeeded(spaceNeeded: number = 40): void {
    if (this.currentY + spaceNeeded > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addTitle(text: string): void {
    this.addPageIfNeeded(15);
    this.doc.setFontSize(20);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addSectionTitle(text: string): void {
    this.addPageIfNeeded(12);
    this.doc.setFontSize(14);
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string, isBold: boolean = false): void {
    this.addPageIfNeeded(8);
    this.doc.setFontSize(10);
    this.doc.setTextColor(60, 60, 60);
    if (isBold) {
      this.doc.setFont('helvetica', 'bold');
    } else {
      this.doc.setFont('helvetica', 'normal');
    }

    const lines = this.doc.splitTextToSize(text, 170);
    lines.forEach((line: string) => {
      this.addPageIfNeeded(7);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
  }

  private addDivider(): void {
    this.addPageIfNeeded(5);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 8;
  }

  private addTags(tags: TagData[]): void {
    if (tags.length === 0) return;

    this.addPageIfNeeded(12);
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Tags:', this.margin, this.currentY);
    this.currentY += 6;

    let xOffset = this.margin + 5;
    tags.forEach((tag) => {
      const tagWidth = this.doc.getTextWidth(tag.tag_name) + 6;

      if (xOffset + tagWidth > 190) {
        this.currentY += 8;
        xOffset = this.margin + 5;
      }

      this.addPageIfNeeded(8);

      // Convert hex color to RGB
      const r = parseInt(tag.color.slice(1, 3), 16);
      const g = parseInt(tag.color.slice(3, 5), 16);
      const b = parseInt(tag.color.slice(5, 7), 16);

      this.doc.setFillColor(r, g, b);
      this.doc.roundedRect(xOffset, this.currentY - 4, tagWidth, 6, 2, 2, 'F');

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.text(tag.tag_name, xOffset + 3, this.currentY);

      xOffset += tagWidth + 4;
    });

    this.currentY += 8;
  }

  private addTableOfContents(profiles: FavoriteExportData[]): void {
    this.addTitle('Table des matières');
    this.currentY += 5;

    profiles.forEach((data, index) => {
      this.addPageIfNeeded(8);
      this.doc.setFontSize(10);
      this.doc.setTextColor(60, 60, 60);
      const name = data.profile.full_name || 'Profil anonyme';
      this.doc.text(`${index + 1}. ${name}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    });

    this.doc.addPage();
    this.currentY = 20;
  }

  private addProfileSection(data: FavoriteExportData, index: number): void {
    // Profile header
    this.addTitle(`${index + 1}. ${data.profile.full_name || 'Profil anonyme'}`);

    // Basic info
    if (data.profile.age) {
      this.addText(`Âge: ${data.profile.age} ans`, true);
    }
    if (data.profile.location) {
      this.addText(`Localisation: ${data.profile.location}`, true);
    }
    if (data.profile.profession) {
      this.addText(`Profession: ${data.profile.profession}`, true);
    }
    if (data.profile.education) {
      this.addText(`Éducation: ${data.profile.education}`, true);
    }

    this.currentY += 3;

    // Compatibility score
    if (data.compatibilityScore !== null) {
      this.addPageIfNeeded(10);
      this.doc.setFontSize(11);
      this.doc.setTextColor(...this.goldColor);
      this.doc.text(
        `Score de compatibilité: ${data.compatibilityScore}%`,
        this.margin,
        this.currentY
      );
      this.currentY += 8;
    }

    // Tags
    if (data.tags.length > 0) {
      this.addTags(data.tags);
    }

    // Bio
    if (data.profile.bio) {
      this.addSectionTitle('Présentation');
      this.addText(data.profile.bio);
      this.currentY += 3;
    }

    // Interests
    if (data.profile.interests && data.profile.interests.length > 0) {
      this.addSectionTitle("Centres d'intérêt");
      this.addText(data.profile.interests.join(', '));
      this.currentY += 3;
    }

    // Private note
    if (data.note) {
      this.addSectionTitle('Note privée');
      this.doc.setFillColor(255, 251, 235);
      const noteLines = this.doc.splitTextToSize(data.note.note, 165);
      const noteHeight = noteLines.length * 6 + 8;

      this.addPageIfNeeded(noteHeight);
      this.doc.roundedRect(this.margin, this.currentY - 2, 170, noteHeight, 2, 2, 'F');
      this.currentY += 3;

      this.addText(data.note.note);
      this.currentY += 3;
    }

    this.currentY += 5;
    this.addDivider();
  }

  async exportSingleProfile(userId: string, profileId: string): Promise<void> {
    const data = await this.fetchProfileData(userId, profileId);
    if (!data) {
      throw new Error('Impossible de récupérer les données du profil');
    }

    const filename = `favori-${data.profile.full_name?.replace(/\s+/g, '-') || 'profil'}.pdf`;

    this.addTitle('Profil favori');
    this.addProfileSection(data, 0);

    this.addFooter();
    this.doc.save(filename);
  }

  async exportMultipleProfiles(userId: string, profileIds: string[]): Promise<void> {
    const allData: FavoriteExportData[] = [];

    for (const profileId of profileIds) {
      const data = await this.fetchProfileData(userId, profileId);
      if (data) {
        allData.push(data);
      }
    }

    if (allData.length === 0) {
      throw new Error('Aucun profil à exporter');
    }

    const filename = `mes-favoris-${new Date().toISOString().split('T')[0]}.pdf`;

    // Cover page
    this.addCoverPage(allData.length);

    // Table of contents
    this.addTableOfContents(allData);

    // Profiles
    allData.forEach((data, index) => {
      this.addProfileSection(data, index);
    });

    this.addFooter();
    this.doc.save(filename);
  }

  private addCoverPage(totalProfiles: number): void {
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, 0, 210, 100, 'F');

    this.doc.setFontSize(28);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Mes Profils Favoris', 105, 50, { align: 'center' });

    this.doc.setFontSize(14);
    this.doc.text(`${totalProfiles} profil${totalProfiles > 1 ? 's' : ''}`, 105, 65, {
      align: 'center',
    });

    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.doc.text(`Exporté le ${date}`, 105, 120, { align: 'center' });

    this.doc.addPage();
    this.currentY = 20;
  }

  private addFooter(): void {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(`Page ${i} sur ${totalPages}`, 105, 290, { align: 'center' });
      this.doc.text('Document confidentiel - Ne pas diffuser', 105, 295, { align: 'center' });
    }
  }

  private async fetchProfileData(
    userId: string,
    profileId: string
  ): Promise<FavoriteExportData | null> {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profileId)
        .single();

      if (profileError) throw profileError;

      // Fetch note
      const { data: note } = await supabase
        .from('profile_notes')
        .select('note, created_at, updated_at')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .maybeSingle();

      // Fetch tags
      let tags: TagData[] = [];
      const { data: favorite } = await supabase
        .from('profile_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (favorite) {
        const { data: favoriteTags } = await supabase
          .from('favorite_tags')
          .select('tag_id, profile_tags(id, tag_name, color)')
          .eq('favorite_id', favorite.id);

        if (favoriteTags) {
          tags = favoriteTags.map((ft: any) => ft.profile_tags).filter(Boolean);
        }
      }

      // Fetch compatibility score
      const { data: match } = await supabase
        .from('matches')
        .select('match_score')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
        .maybeSingle();

      return {
        profile,
        note,
        tags,
        compatibilityScore: match?.match_score || null,
      };
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return null;
    }
  }
}
