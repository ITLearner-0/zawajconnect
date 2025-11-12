import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProfileData {
  id: string;
  full_name: string;
  age?: number;
  location?: string;
  occupation?: string;
}

interface ComparisonData {
  profiles: ProfileData[];
  scores: {
    profileId: string;
    overall: number;
    islamic: number;
    cultural: number;
    personality: number;
  }[];
  insights?: any;
}

interface ExportOptions {
  comparisonName: string;
  comparisonDate: string;
  data: ComparisonData;
  notes?: string;
  radarChartElement?: HTMLElement;
}

class ComparisonPdfExportService {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generatePDF(options: ExportOptions): Promise<void> {
    // Cover page
    this.addCoverPage(options.comparisonName, options.comparisonDate, options.data.profiles.length);

    // Profiles summary
    this.addProfilesSummaryPage(options.data.profiles);

    // Radar chart
    if (options.radarChartElement) {
      await this.addRadarChartPage(options.radarChartElement);
    }

    // Scores table
    this.addScoresTablePage(options.data);

    // Notes
    if (options.notes) {
      this.addNotesPage(options.notes);
    }

    // Recommendations
    this.addRecommendationsPage(options.data);

    // Save PDF
    this.pdf.save(
      `Comparaison_${options.comparisonName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
    );
  }

  private addCoverPage(comparisonName: string, date: string, profileCount: number): void {
    // Background gradient simulation
    this.pdf.setFillColor(16, 185, 129); // emerald
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');

    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(32);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Comparaison de Profils', this.pageWidth / 2, 40, { align: 'center' });

    // Subtitle
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(comparisonName, this.pageWidth / 2, 55, { align: 'center' });

    // Info box
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.roundedRect(this.margin, 100, this.pageWidth - 2 * this.margin, 60, 3, 3, 'F');

    this.pdf.setTextColor(31, 41, 55);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Informations de la comparaison', this.pageWidth / 2, 115, { align: 'center' });

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Date: ${date}`, this.margin + 10, 130);
    this.pdf.text(`Nombre de profils: ${profileCount}`, this.margin + 10, 140);
    this.pdf.text('Type: Analyse comparative détaillée', this.margin + 10, 150);

    // Footer
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(107, 114, 128);
    this.pdf.text(
      'Zawaj Connect - Plateforme de rencontre musulmane',
      this.pageWidth / 2,
      this.pageHeight - 15,
      { align: 'center' }
    );
    this.pdf.text(
      'Document confidentiel - Ne pas diffuser',
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }

  private addProfilesSummaryPage(profiles: ProfileData[]): void {
    this.pdf.addPage();
    this.currentY = this.margin;

    // Header
    this.pdf.setFillColor(16, 185, 129);
    this.pdf.rect(0, 0, this.pageWidth, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Profils comparés', this.pageWidth / 2, 13, { align: 'center' });

    this.currentY = 35;
    this.pdf.setTextColor(31, 41, 55);

    profiles.forEach((profile, index) => {
      // Profile card
      this.pdf.setFillColor(249, 250, 251);
      this.pdf.roundedRect(
        this.margin,
        this.currentY,
        this.pageWidth - 2 * this.margin,
        40,
        3,
        3,
        'F'
      );

      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(
        `Profil ${index + 1}: ${profile.full_name}`,
        this.margin + 5,
        this.currentY + 10
      );

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      if (profile.age) {
        this.pdf.text(`Âge: ${profile.age} ans`, this.margin + 5, this.currentY + 20);
      }
      if (profile.location) {
        this.pdf.text(`Localisation: ${profile.location}`, this.margin + 5, this.currentY + 27);
      }
      if (profile.occupation) {
        this.pdf.text(`Profession: ${profile.occupation}`, this.margin + 5, this.currentY + 34);
      }

      this.currentY += 50;

      if (this.currentY > this.pageHeight - 40) {
        this.pdf.addPage();
        this.currentY = this.margin;
      }
    });
  }

  private async addRadarChartPage(chartElement: HTMLElement): Promise<void> {
    this.pdf.addPage();
    this.currentY = this.margin;

    // Header
    this.pdf.setFillColor(16, 185, 129);
    this.pdf.rect(0, 0, this.pageWidth, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Graphiques de compatibilité', this.pageWidth / 2, 13, { align: 'center' });

    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pageWidth - 2 * this.margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      this.pdf.addImage(imgData, 'PNG', this.margin, 35, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error capturing radar chart:', error);
      this.pdf.setTextColor(220, 38, 38);
      this.pdf.setFontSize(12);
      this.pdf.text('Erreur lors de la capture du graphique', this.pageWidth / 2, 60, {
        align: 'center',
      });
    }
  }

  private addScoresTablePage(data: ComparisonData): void {
    this.pdf.addPage();
    this.currentY = this.margin;

    // Header
    this.pdf.setFillColor(16, 185, 129);
    this.pdf.rect(0, 0, this.pageWidth, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Scores de compatibilité détaillés', this.pageWidth / 2, 13, { align: 'center' });

    this.currentY = 35;
    this.pdf.setTextColor(31, 41, 55);

    // Table headers
    const colWidth = (this.pageWidth - 2 * this.margin) / 5;
    this.pdf.setFillColor(229, 231, 235);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Profil', this.margin + 2, this.currentY + 7);
    this.pdf.text('Global', this.margin + colWidth + 2, this.currentY + 7);
    this.pdf.text('Islamic', this.margin + 2 * colWidth + 2, this.currentY + 7);
    this.pdf.text('Cultural', this.margin + 3 * colWidth + 2, this.currentY + 7);
    this.pdf.text('Personality', this.margin + 4 * colWidth + 2, this.currentY + 7);

    this.currentY += 10;

    // Table rows
    data.scores.forEach((score, index) => {
      const profile = data.profiles.find((p) => p.id === score.profileId);
      const rowHeight = 10;

      if (index % 2 === 0) {
        this.pdf.setFillColor(249, 250, 251);
        this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, rowHeight, 'F');
      }

      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(profile?.full_name || 'Unknown', this.margin + 2, this.currentY + 7);
      this.pdf.text(`${score.overall}%`, this.margin + colWidth + 2, this.currentY + 7);
      this.pdf.text(`${score.islamic}%`, this.margin + 2 * colWidth + 2, this.currentY + 7);
      this.pdf.text(`${score.cultural}%`, this.margin + 3 * colWidth + 2, this.currentY + 7);
      this.pdf.text(`${score.personality}%`, this.margin + 4 * colWidth + 2, this.currentY + 7);

      this.currentY += rowHeight;
    });
  }

  private addNotesPage(notes: string): void {
    this.pdf.addPage();
    this.currentY = this.margin;

    // Header
    this.pdf.setFillColor(16, 185, 129);
    this.pdf.rect(0, 0, this.pageWidth, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Notes personnelles', this.pageWidth / 2, 13, { align: 'center' });

    this.currentY = 35;
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');

    const lines = this.pdf.splitTextToSize(notes, this.pageWidth - 2 * this.margin);
    this.pdf.text(lines, this.margin, this.currentY);
  }

  private addRecommendationsPage(data: ComparisonData): void {
    this.pdf.addPage();
    this.currentY = this.margin;

    // Header
    this.pdf.setFillColor(16, 185, 129);
    this.pdf.rect(0, 0, this.pageWidth, 20, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Recommandations', this.pageWidth / 2, 13, { align: 'center' });

    this.currentY = 35;
    this.pdf.setTextColor(31, 41, 55);

    // Find best match
    const bestMatch = data.scores.reduce((prev, current) =>
      current.overall > prev.overall ? current : prev
    );
    const bestProfile = data.profiles.find((p) => p.id === bestMatch.profileId);

    // Best match recommendation
    this.pdf.setFillColor(240, 253, 244);
    this.pdf.roundedRect(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      30,
      3,
      3,
      'F'
    );

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(22, 163, 74);
    this.pdf.text('✓ Meilleur match', this.margin + 5, this.currentY + 10);

    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(31, 41, 55);
    this.pdf.text(
      `${bestProfile?.full_name} présente le score de compatibilité global le plus élevé (${bestMatch.overall}%).`,
      this.margin + 5,
      this.currentY + 20,
      { maxWidth: this.pageWidth - 2 * this.margin - 10 }
    );

    this.currentY += 40;

    // Category analysis
    const categories = [
      { name: 'Valeurs islamiques', key: 'islamic' as const },
      { name: 'Compatibilité culturelle', key: 'cultural' as const },
      { name: 'Personnalité', key: 'personality' as const },
    ];

    categories.forEach((category) => {
      const best = data.scores.reduce((prev, current) =>
        current[category.key] > prev[category.key] ? current : prev
      );
      const profile = data.profiles.find((p) => p.id === best.profileId);

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`• ${category.name}:`, this.margin + 5, this.currentY);

      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `${profile?.full_name} (${best[category.key]}%)`,
        this.margin + 60,
        this.currentY
      );

      this.currentY += 10;
    });

    // General recommendation
    this.currentY += 10;
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(107, 114, 128);
    const recommendation = this.pdf.splitTextToSize(
      "Prenez le temps d'analyser chaque profil en détail. Les scores sont des indicateurs, mais la compatibilité réelle se révèle dans l'échange et la connaissance mutuelle. Impliquez votre famille dans le processus de décision conformément aux valeurs islamiques.",
      this.pageWidth - 2 * this.margin
    );
    this.pdf.text(recommendation, this.margin, this.currentY);
  }
}

export async function generateComparisonPDF(options: ExportOptions): Promise<void> {
  const service = new ComparisonPdfExportService();
  await service.generatePDF(options);
}
