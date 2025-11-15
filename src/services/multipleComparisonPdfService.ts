import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfileData {
  id: string;
  full_name: string;
  age: number;
  location: string;
  occupation: string;
}

interface ComparisonScore {
  profileId: string;
  overall: number;
  islamic: number;
  cultural: number;
  personality: number;
}

interface ComparisonData {
  profiles: ProfileData[];
  scores: ComparisonScore[];
  insights?: any;
}

interface ComparisonSection {
  id: string;
  name: string;
  date: string;
  data: ComparisonData;
  notes?: string;
  rating?: number | null;
}

interface MultipleComparisonPDFOptions {
  comparisons: ComparisonSection[];
  exportDate: string;
  userName?: string;
}

export const generateMultipleComparisonPDF = async (
  options: MultipleComparisonPDFOptions
): Promise<void> => {
  const { comparisons, exportDate, userName } = options;
  const doc = new jsPDF();
  let currentY = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // Helper to add text with word wrap
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.5); // Return height used
  };

  // === COVER PAGE ===
  doc.setFillColor(16, 185, 129); // emerald color
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport Consolidé', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Comparaisons de Profils', pageWidth / 2, 55, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  currentY = 100;

  doc.setFont('helvetica', 'bold');
  doc.text('Généré le:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(exportDate, margin + 30, currentY);
  currentY += 10;

  if (userName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Utilisateur:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(userName, margin + 30, currentY);
    currentY += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Nombre de comparaisons:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(comparisons.length.toString(), margin + 60, currentY);
  currentY += 20;

  // === TABLE OF CONTENTS ===
  checkPageBreak(40);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY - 5, contentWidth, 15, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Table des Matières', margin + 5, currentY + 5);
  currentY += 25;

  comparisons.forEach((comparison, index) => {
    checkPageBreak(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const tocEntry = `${index + 1}. ${comparison.name} - ${comparison.date}`;
    doc.text(tocEntry, margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${comparison.data.profiles.length} profils`, pageWidth - margin - 30, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 8;
  });

  currentY += 10;

  // === GLOBAL SYNTHESIS ===
  doc.addPage();
  currentY = 20;

  doc.setFillColor(251, 191, 36); // gold color
  doc.rect(margin, currentY - 5, contentWidth, 15, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Synthèse Comparative Globale', margin + 5, currentY + 5);
  doc.setTextColor(0, 0, 0);
  currentY += 25;

  // Calculate global statistics
  const totalProfiles = new Set(comparisons.flatMap((c) => c.data.profiles.map((p) => p.id))).size;
  const avgRating =
    comparisons.filter((c) => c.rating !== null).reduce((sum, c) => sum + (c.rating || 0), 0) /
    comparisons.filter((c) => c.rating !== null).length;

  const allScores = comparisons.flatMap((c) => c.data.scores);
  const avgOverall = allScores.reduce((sum, s) => sum + s.overall, 0) / allScores.length;
  const avgIslamic = allScores.reduce((sum, s) => sum + s.islamic, 0) / allScores.length;
  const avgCultural = allScores.reduce((sum, s) => sum + s.cultural, 0) / allScores.length;
  const avgPersonality = allScores.reduce((sum, s) => sum + s.personality, 0) / allScores.length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  checkPageBreak(60);
  doc.text('📊 Statistiques Générales', margin, currentY);
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`• Nombre total de comparaisons: ${comparisons.length}`, margin + 5, currentY);
  currentY += 7;
  doc.text(`• Profils uniques analysés: ${totalProfiles}`, margin + 5, currentY);
  currentY += 7;
  doc.text(`• Note moyenne: ${avgRating ? avgRating.toFixed(1) : 'N/A'} ⭐`, margin + 5, currentY);
  currentY += 12;

  doc.setFont('helvetica', 'bold');
  doc.text('🎯 Scores de Compatibilité Moyens', margin, currentY);
  currentY += 8;
  doc.setFont('helvetica', 'normal');

  // Overall score bar
  doc.text(`Global: ${avgOverall.toFixed(0)}%`, margin + 5, currentY);
  doc.setFillColor(16, 185, 129);
  doc.rect(margin + 50, currentY - 4, (avgOverall / 100) * 100, 5, 'F');
  currentY += 10;

  // Islamic score bar
  doc.text(`Islamique: ${avgIslamic.toFixed(0)}%`, margin + 5, currentY);
  doc.setFillColor(59, 130, 246);
  doc.rect(margin + 50, currentY - 4, (avgIslamic / 100) * 100, 5, 'F');
  currentY += 10;

  // Cultural score bar
  doc.text(`Culturel: ${avgCultural.toFixed(0)}%`, margin + 5, currentY);
  doc.setFillColor(168, 85, 247);
  doc.rect(margin + 50, currentY - 4, (avgCultural / 100) * 100, 5, 'F');
  currentY += 10;

  // Personality score bar
  doc.text(`Personnalité: ${avgPersonality.toFixed(0)}%`, margin + 5, currentY);
  doc.setFillColor(251, 191, 36);
  doc.rect(margin + 50, currentY - 4, (avgPersonality / 100) * 100, 5, 'F');
  currentY += 15;

  // Top rated comparisons
  const topComparisons = comparisons
    .filter((c) => c.rating !== null)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  if (topComparisons.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.text('⭐ Meilleures Comparaisons', margin, currentY);
    currentY += 8;
    doc.setFont('helvetica', 'normal');

    topComparisons.forEach((comp, idx) => {
      checkPageBreak(8);
      doc.text(`${idx + 1}. ${comp.name} (${comp.rating}⭐) - ${comp.date}`, margin + 5, currentY);
      currentY += 7;
    });
  }

  // === INDIVIDUAL COMPARISONS ===
  comparisons.forEach((comparison, compIndex) => {
    doc.addPage();
    currentY = 20;

    // Section header
    doc.setFillColor(243, 244, 246);
    doc.rect(0, currentY - 10, pageWidth, 25, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Comparaison ${compIndex + 1}: ${comparison.name}`, margin, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(comparison.date, margin, currentY);
    if (comparison.rating) {
      doc.text(`${'⭐'.repeat(comparison.rating)}`, pageWidth - margin - 20, currentY);
    }
    doc.setTextColor(0, 0, 0);
    currentY += 20;

    // Profiles section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Profils Comparés', margin, currentY);
    currentY += 10;

    comparison.data.profiles.forEach((profile, idx) => {
      checkPageBreak(30);
      const score = comparison.data.scores.find((s) => s.profileId === profile.id);

      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY - 5, contentWidth, 25, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Profil ${idx + 1}: ${profile.full_name}`, margin + 5, currentY);
      currentY += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(
        `${profile.age} ans • ${profile.location} • ${profile.occupation}`,
        margin + 5,
        currentY
      );
      currentY += 7;

      if (score) {
        doc.setFontSize(9);
        doc.text(
          `Compatibilité: ${score.overall}% (I:${score.islamic}% C:${score.cultural}% P:${score.personality}%)`,
          margin + 5,
          currentY
        );
      }
      currentY += 12;
    });

    // Compatibility scores visualization
    currentY += 5;
    checkPageBreak(80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores de Compatibilité', margin, currentY);
    currentY += 10;

    comparison.data.scores.forEach((score, idx) => {
      checkPageBreak(25);
      const profile = comparison.data.profiles.find((p) => p.id === score.profileId);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${profile?.full_name || `Profil ${idx + 1}`}`, margin, currentY);
      currentY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      // Score bars
      ['overall', 'islamic', 'cultural', 'personality'].forEach((key, barIdx) => {
        const value = score[key as keyof ComparisonScore] as number;
        const label =
          key === 'overall'
            ? 'Global'
            : key === 'islamic'
              ? 'Islamique'
              : key === 'cultural'
                ? 'Culturel'
                : 'Personnalité';
        const colors: [number, number, number][] = [
          [16, 185, 129],
          [59, 130, 246],
          [168, 85, 247],
          [251, 191, 36],
        ];
        const color = colors[barIdx] || [16, 185, 129];

        doc.text(`${label}: ${value}%`, margin + 5, currentY);
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(margin + 40, currentY - 3, (value / 100) * 80, 4, 'F');
        currentY += 6;
      });

      currentY += 5;
    });

    // Notes section
    if (comparison.notes) {
      checkPageBreak(30);
      currentY += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', margin, currentY);
      currentY += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const notesHeight = addWrappedText(comparison.notes, margin, currentY, contentWidth - 10, 9);
      currentY += notesHeight + 5;
    }
  });

  // === FOOTER ON EACH PAGE ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${totalPages} • Généré par Mariage Halal • ${exportDate}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `comparaisons-consolidees-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(filename);
};
