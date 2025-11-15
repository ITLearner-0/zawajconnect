import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CompatibilityInsights } from '@/types/compatibility';

interface ExportOptions {
  insights: CompatibilityInsights;
  userName?: string;
  completionPercentage: number;
}

/**
 * Génère un PDF complet avec page de couverture et graphiques
 */
export async function generateEnhancedPDF(options: ExportOptions): Promise<void> {
  const service = new EnhancedPdfExportService();
  await service.generatePDF(options);
}

class EnhancedPdfExportService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private yPosition: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generatePDF(options: ExportOptions): Promise<void> {
    // Page de couverture
    this.addCoverPage(options.userName || 'Utilisateur', options.completionPercentage);

    // Page 2: Résumé et scores
    this.doc.addPage();
    this.yPosition = this.margin;
    await this.addSummaryPage(options.insights);

    // Page 3: Scores détaillés avec graphiques circulaires
    this.doc.addPage();
    this.yPosition = this.margin;
    await this.addCompatibilityScoresPage(options.insights);

    // Page 4: Suggestions d'amélioration
    this.doc.addPage();
    this.yPosition = this.margin;
    this.addSuggestionsPage(options.insights);

    // Page 5: Red Flags (si présents)
    if (options.insights.redFlags.length > 0) {
      this.doc.addPage();
      this.yPosition = this.margin;
      this.addRedFlagsPage(options.insights);
    }

    // Page 6: Guidance islamique
    this.doc.addPage();
    this.yPosition = this.margin;
    this.addIslamicGuidancePage(options.insights);

    // Télécharger
    this.doc.save('mes-insights-compatibilite-complet.pdf');
  }

  /**
   * Page de couverture professionnelle
   */
  private addCoverPage(userName: string, completionPercentage: number): void {
    const centerX = this.pageWidth / 2;

    // Fond coloré en haut
    this.doc.setFillColor(16, 185, 129); // Primary color
    this.doc.rect(0, 0, this.pageWidth, 80, 'F');

    // Logo / Icône (cercle avec initiales)
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(centerX, 50, 20, 'F');
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const initials = userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const initialsWidth = this.doc.getTextWidth(initials);
    this.doc.text(initials, centerX - initialsWidth / 2, 55);

    // Titre principal
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    const title = 'Insights de Compatibilité';
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, centerX - titleWidth / 2, 110);

    // Sous-titre
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const subtitle = 'Analyse Détaillée de Votre Profil';
    const subtitleWidth = this.doc.getTextWidth(subtitle);
    this.doc.text(subtitle, centerX - subtitleWidth / 2, 125);

    // Nom de l'utilisateur
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(16, 185, 129);
    const nameWidth = this.doc.getTextWidth(userName);
    this.doc.text(userName, centerX - nameWidth / 2, 150);

    // Badge de complétion
    const badgeY = 170;
    const badgeWidth = 80;
    const badgeHeight = 30;
    const badgeX = centerX - badgeWidth / 2;

    // Badge background
    this.doc.setFillColor(16, 185, 129, 0.1);
    this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 5, 5, 'F');

    // Badge border
    this.doc.setDrawColor(16, 185, 129);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 5, 5, 'S');

    // Badge text
    this.doc.setFontSize(12);
    this.doc.setTextColor(16, 185, 129);
    const badgeText = `Profil ${Math.round(completionPercentage)}%`;
    const badgeTextWidth = this.doc.getTextWidth(badgeText);
    this.doc.text(badgeText, centerX - badgeTextWidth / 2, badgeY + 19);

    // Date de génération
    this.doc.setFontSize(12);
    this.doc.setTextColor(150, 150, 150);
    const date = `Généré le ${new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`;
    const dateWidth = this.doc.getTextWidth(date);
    this.doc.text(date, centerX - dateWidth / 2, 220);

    // Ligne décorative
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 240, this.pageWidth - this.margin, 240);

    // Footer
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    const footerText = 'Zawaj Connect - Plateforme de mariage musulman';
    const footerWidth = this.doc.getTextWidth(footerText);
    this.doc.text(footerText, centerX - footerWidth / 2, this.pageHeight - 20);
  }

  /**
   * Page de résumé
   */
  private async addSummaryPage(insights: CompatibilityInsights): Promise<void> {
    // Titre
    this.doc.setFontSize(20);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Résumé de Votre Profil', this.margin, this.yPosition);
    this.yPosition += 15;

    // Ligne séparatrice
    this.doc.setDrawColor(16, 185, 129);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 15;

    // Résumé de la personnalité
    this.doc.setFontSize(14);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Votre Personnalité', this.margin, this.yPosition);
    this.yPosition += 8;

    this.doc.setFontSize(11);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'normal');
    const summaryLines = this.doc.splitTextToSize(
      insights.summary,
      this.pageWidth - 2 * this.margin
    );
    summaryLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += 6;
    });
    this.yPosition += 10;

    // Priorités
    this.doc.setFontSize(14);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Vos Priorités', this.margin, this.yPosition);
    this.yPosition += 8;

    this.doc.setFontSize(11);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'normal');

    insights.priorities.slice(0, 5).forEach((priority) => {
      // Bullet point
      this.doc.circle(this.margin + 2, this.yPosition - 2, 1, 'F');
      this.doc.text(priority, this.margin + 6, this.yPosition);
      this.yPosition += 7;
    });
    this.yPosition += 10;

    // Style relationnel
    this.doc.setFontSize(14);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Style Relationnel', this.margin, this.yPosition);
    this.yPosition += 8;

    this.doc.setFontSize(11);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'normal');
    const styleLines = this.doc.splitTextToSize(
      insights.relationshipStyle,
      this.pageWidth - 2 * this.margin
    );
    styleLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += 6;
    });
  }

  /**
   * Page des scores de compatibilité avec graphiques circulaires
   */
  private async addCompatibilityScoresPage(insights: CompatibilityInsights): Promise<void> {
    // Titre
    this.doc.setFontSize(20);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Scores de Compatibilité', this.margin, this.yPosition);
    this.yPosition += 15;

    // Ligne séparatrice
    this.doc.setDrawColor(16, 185, 129);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 20;

    // Créer des graphiques circulaires pour chaque domaine
    const areas = insights.compatibilityAreas.slice(0, 6); // Limiter à 6 pour l'espace
    const cols = 2;
    const rows = Math.ceil(areas.length / cols);
    const chartSize = 30;
    const spacing = 15;
    const colWidth = (this.pageWidth - 2 * this.margin) / cols;

    areas.forEach((area, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = this.margin + col * colWidth + colWidth / 2;
      const y = this.yPosition + row * (chartSize * 2 + spacing + 20);

      // Dessiner le graphique circulaire
      this.drawCircularProgress(x, y, chartSize, area.score);

      // Nom de la catégorie
      this.doc.setFontSize(11);
      this.doc.setTextColor(60, 60, 60);
      this.doc.setFont('helvetica', 'bold');
      const categoryWidth = this.doc.getTextWidth(area.category);
      this.doc.text(area.category, x - categoryWidth / 2, y + chartSize + 10);

      // Description
      this.doc.setFontSize(9);
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFont('helvetica', 'normal');
      const descLines = this.doc.splitTextToSize(area.description, colWidth - 20);
      descLines.slice(0, 2).forEach((line: string, lineIndex: number) => {
        const lineWidth = this.doc.getTextWidth(line);
        this.doc.text(line, x - lineWidth / 2, y + chartSize + 17 + lineIndex * 5);
      });
    });
  }

  /**
   * Dessiner un graphique circulaire de progression
   */
  private drawCircularProgress(x: number, y: number, radius: number, percentage: number): void {
    // Cercle de fond
    this.doc.setFillColor(240, 240, 240);
    this.doc.circle(x, y, radius, 'F');

    // Arc de progression
    const startAngle = -90; // Commencer en haut
    const endAngle = startAngle + (360 * percentage) / 100;

    // Couleur basée sur le score
    if (percentage >= 80) {
      this.doc.setFillColor(16, 185, 129); // Vert
    } else if (percentage >= 60) {
      this.doc.setFillColor(251, 191, 36); // Jaune
    } else {
      this.doc.setFillColor(239, 68, 68); // Rouge
    }

    // Dessiner l'arc (approximation avec des segments)
    const segments = 50;
    const angleStep = (endAngle - startAngle) / segments;

    for (let i = 0; i <= segments; i++) {
      const angle1 = ((startAngle + i * angleStep) * Math.PI) / 180;
      const angle2 = ((startAngle + (i + 1) * angleStep) * Math.PI) / 180;

      const x1 = x + radius * 0.7 * Math.cos(angle1);
      const y1 = y + radius * 0.7 * Math.sin(angle1);
      const x2 = x + radius * Math.cos(angle1);
      const y2 = y + radius * Math.sin(angle1);
      const x3 = x + radius * Math.cos(angle2);
      const y3 = y + radius * Math.sin(angle2);
      const x4 = x + radius * 0.7 * Math.cos(angle2);
      const y4 = y + radius * 0.7 * Math.sin(angle2);

      this.doc.triangle(x1, y1, x2, y2, x3, y3, 'F');
      this.doc.triangle(x1, y1, x3, y3, x4, y4, 'F');
    }

    // Cercle intérieur blanc
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(x, y, radius * 0.65, 'F');

    // Pourcentage au centre
    this.doc.setFontSize(14);
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFont('helvetica', 'bold');
    const scoreText = `${percentage}%`;
    const textWidth = this.doc.getTextWidth(scoreText);
    this.doc.text(scoreText, x - textWidth / 2, y + 4);
  }

  /**
   * Page des suggestions avec icônes
   */
  private addSuggestionsPage(insights: CompatibilityInsights): void {
    // Titre
    this.doc.setFontSize(20);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text("Suggestions d'Amélioration", this.margin, this.yPosition);
    this.yPosition += 15;

    // Ligne séparatrice
    this.doc.setDrawColor(16, 185, 129);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 15;

    // Suggestions
    insights.suggestions.forEach((suggestion) => {
      if (this.yPosition > this.pageHeight - 40) {
        this.doc.addPage();
        this.yPosition = this.margin;
      }

      // Icône colorée (cercle avec symbole)
      let iconColor: [number, number, number];
      if (suggestion.priority === 'high') {
        iconColor = [239, 68, 68]; // Rouge
      } else if (suggestion.priority === 'medium') {
        iconColor = [251, 191, 36]; // Jaune
      } else {
        iconColor = [59, 130, 246]; // Bleu
      }

      this.doc.setFillColor(...iconColor);
      this.doc.circle(this.margin + 5, this.yPosition + 3, 5, 'F');

      // Symbole dans l'icône
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      const symbol =
        suggestion.priority === 'high' ? '!' : suggestion.priority === 'medium' ? '•' : 'i';
      const symbolWidth = this.doc.getTextWidth(symbol);
      this.doc.text(symbol, this.margin + 5 - symbolWidth / 2, this.yPosition + 6);

      // Badge de priorité
      const badgeX = this.margin + 15;
      const badgeY = this.yPosition - 2;
      const badgeText =
        suggestion.priority === 'high'
          ? 'Haute'
          : suggestion.priority === 'medium'
            ? 'Moyenne'
            : 'Basse';

      this.doc.setFillColor(...iconColor, 0.2);
      this.doc.roundedRect(badgeX, badgeY, 20, 6, 2, 2, 'F');

      this.doc.setTextColor(...iconColor);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(badgeText, badgeX + 2, badgeY + 4.5);

      // Titre de la suggestion
      this.doc.setFontSize(12);
      this.doc.setTextColor(60, 60, 60);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(suggestion.title, this.margin + 40, this.yPosition + 5);
      this.yPosition += 10;

      // Description
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFont('helvetica', 'normal');
      const descLines = this.doc.splitTextToSize(
        suggestion.description,
        this.pageWidth - 2 * this.margin - 40
      );
      descLines.forEach((line: string) => {
        this.doc.text(line, this.margin + 15, this.yPosition);
        this.yPosition += 6;
      });

      this.yPosition += 8;
    });
  }

  /**
   * Page des red flags
   */
  private addRedFlagsPage(insights: CompatibilityInsights): void {
    // Titre avec icône d'alerte
    this.doc.setFontSize(20);
    this.doc.setTextColor(239, 68, 68); // Rouge
    this.doc.setFont('helvetica', 'bold');
    this.doc.text("Points d'Attention", this.margin, this.yPosition);
    this.yPosition += 15;

    // Ligne séparatrice rouge
    this.doc.setDrawColor(239, 68, 68);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 15;

    // Message d'introduction
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(
      'Ces points méritent votre attention pour améliorer votre recherche.',
      this.margin,
      this.yPosition
    );
    this.yPosition += 15;

    // Red flags
    insights.redFlags.forEach((flag) => {
      if (this.yPosition > this.pageHeight - 40) {
        this.doc.addPage();
        this.yPosition = this.margin;
      }

      // Encadré pour chaque red flag
      const boxHeight = 35;
      const boxY = this.yPosition;

      // Fond coloré selon la sévérité
      let bgColor: [number, number, number, number];
      let borderColor: [number, number, number];

      if (flag.severity === 'critical') {
        bgColor = [239, 68, 68, 0.1]; // Rouge clair
        borderColor = [239, 68, 68];
      } else if (flag.severity === 'important') {
        bgColor = [251, 191, 36, 0.1]; // Jaune clair
        borderColor = [251, 191, 36];
      } else {
        bgColor = [156, 163, 175, 0.1]; // Gris clair
        borderColor = [156, 163, 175];
      }

      this.doc.setFillColor(...bgColor);
      this.doc.roundedRect(
        this.margin,
        boxY,
        this.pageWidth - 2 * this.margin,
        boxHeight,
        3,
        3,
        'F'
      );

      // Bordure
      this.doc.setDrawColor(...borderColor);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(
        this.margin,
        boxY,
        this.pageWidth - 2 * this.margin,
        boxHeight,
        3,
        3,
        'S'
      );

      // Badge de sévérité
      this.doc.setFillColor(...borderColor);
      this.doc.roundedRect(this.margin + 5, boxY + 5, 25, 6, 2, 2, 'F');

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      const severityText =
        flag.severity === 'critical'
          ? 'Critique'
          : flag.severity === 'important'
            ? 'Important'
            : 'Attention';
      this.doc.text(severityText, this.margin + 7, boxY + 9.5);

      // Titre
      this.doc.setFontSize(11);
      this.doc.setTextColor(60, 60, 60);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(flag.title, this.margin + 35, boxY + 10);

      // Description
      this.doc.setFontSize(9);
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'normal');
      const descLines = this.doc.splitTextToSize(
        flag.description,
        this.pageWidth - 2 * this.margin - 12
      );
      descLines.slice(0, 3).forEach((line: string, index: number) => {
        this.doc.text(line, this.margin + 8, boxY + 20 + index * 5);
      });

      this.yPosition += boxHeight + 8;
    });
  }

  /**
   * Page de guidance islamique
   */
  private addIslamicGuidancePage(insights: CompatibilityInsights): void {
    // Titre
    this.doc.setFontSize(20);
    this.doc.setTextColor(16, 185, 129);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Guidance Islamique', this.margin, this.yPosition);
    this.yPosition += 15;

    // Ligne séparatrice
    this.doc.setDrawColor(16, 185, 129);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 15;

    // Guidances
    insights.islamicGuidance.slice(0, 3).forEach((guidance) => {
      if (this.yPosition > this.pageHeight - 60) {
        this.doc.addPage();
        this.yPosition = this.margin;
      }

      // Encadré
      const boxStartY = this.yPosition;

      // Titre
      this.doc.setFontSize(12);
      this.doc.setTextColor(16, 185, 129);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(guidance.title, this.margin + 5, this.yPosition);
      this.yPosition += 8;

      // Verset
      this.doc.setFontSize(10);
      this.doc.setTextColor(60, 60, 60);
      this.doc.setFont('helvetica', 'italic');
      const verseLines = this.doc.splitTextToSize(
        `"${guidance.verse}"`,
        this.pageWidth - 2 * this.margin - 10
      );
      verseLines.forEach((line: string) => {
        this.doc.text(line, this.margin + 5, this.yPosition);
        this.yPosition += 5;
      });
      this.yPosition += 3;

      // Source
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`— ${guidance.source}`, this.margin + 10, this.yPosition);
      this.yPosition += 8;

      // Application
      this.doc.setFontSize(9);
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'normal');
      const appLines = this.doc.splitTextToSize(
        guidance.application,
        this.pageWidth - 2 * this.margin - 10
      );
      appLines.forEach((line: string) => {
        this.doc.text(line, this.margin + 5, this.yPosition);
        this.yPosition += 5;
      });

      const boxEndY = this.yPosition + 5;

      // Bordure de l'encadré
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(
        this.margin,
        boxStartY - 5,
        this.pageWidth - 2 * this.margin,
        boxEndY - boxStartY,
        2,
        2,
        'S'
      );

      this.yPosition = boxEndY + 10;
    });
  }
}
