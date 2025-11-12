import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface CallStats {
  totalCalls: number;
  avgDuration: number;
  successRate: number;
  audioCallsCount: number;
  videoCallsCount: number;
  callsByDay: { date: string; count: number }[];
  callsByStatus: { status: string; count: number }[];
  avgDurationByType: { type: string; duration: number }[];
  callsByHour: { hour: number; count: number }[];
  qualityMetrics: {
    avgRating: number;
    totalFeedbacks: number;
    excellentCount: number;
    goodCount: number;
    fairCount: number;
    poorCount: number;
  };
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const exportToExcel = (stats: CallStats, timeRange: string) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Rapport Analytics des Appels'],
    ['Période', timeRange],
    ['Date de génération', new Date().toLocaleString('fr-FR')],
    [],
    ['STATISTIQUES GÉNÉRALES'],
    ['Métrique', 'Valeur'],
    ['Total Appels', stats.totalCalls],
    ['Appels Audio', stats.audioCallsCount],
    ['Appels Vidéo', stats.videoCallsCount],
    ['Durée Moyenne', formatDuration(stats.avgDuration)],
    ['Taux de Réussite', `${stats.successRate}%`],
    ['Note Qualité Moyenne', `${stats.qualityMetrics.avgRating.toFixed(2)}/5`],
    ['Total Feedbacks', stats.qualityMetrics.totalFeedbacks],
    [],
    ['QUALITÉ DES APPELS'],
    ['Catégorie', 'Nombre'],
    ['Excellent (5 étoiles)', stats.qualityMetrics.excellentCount],
    ['Bon (4 étoiles)', stats.qualityMetrics.goodCount],
    ['Moyen (3 étoiles)', stats.qualityMetrics.fairCount],
    ['Faible (≤2 étoiles)', stats.qualityMetrics.poorCount],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

  // Calls by day sheet
  const callsByDayData = [
    ['APPELS PAR JOUR'],
    ['Date', 'Nombre d\'appels'],
    ...stats.callsByDay.map(item => [item.date, item.count])
  ];
  const wsCallsByDay = XLSX.utils.aoa_to_sheet(callsByDayData);
  XLSX.utils.book_append_sheet(wb, wsCallsByDay, 'Appels par Jour');

  // Calls by status sheet
  const callsByStatusData = [
    ['APPELS PAR STATUT'],
    ['Statut', 'Nombre'],
    ...stats.callsByStatus.map(item => [item.status, item.count])
  ];
  const wsCallsByStatus = XLSX.utils.aoa_to_sheet(callsByStatusData);
  XLSX.utils.book_append_sheet(wb, wsCallsByStatus, 'Statuts');

  // Duration by type sheet
  const durationByTypeData = [
    ['DURÉE MOYENNE PAR TYPE'],
    ['Type', 'Durée (secondes)', 'Durée (formatée)'],
    ...stats.avgDurationByType.map(item => [
      item.type,
      item.duration,
      formatDuration(item.duration)
    ])
  ];
  const wsDuration = XLSX.utils.aoa_to_sheet(durationByTypeData);
  XLSX.utils.book_append_sheet(wb, wsDuration, 'Durées par Type');

  // Calls by hour sheet
  const callsByHourData = [
    ['APPELS PAR HEURE'],
    ['Heure', 'Nombre d\'appels'],
    ...stats.callsByHour.map(item => [`${item.hour}:00`, item.count])
  ];
  const wsCallsByHour = XLSX.utils.aoa_to_sheet(callsByHourData);
  XLSX.utils.book_append_sheet(wb, wsCallsByHour, 'Appels par Heure');

  // Generate file
  const fileName = `analytics-appels-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToPDF = async (stats: CallStats, timeRange: string, chartsContainerId: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yOffset = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Rapport Analytics des Appels', pageWidth / 2, yOffset, { align: 'center' });
  
  yOffset += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Période: ${timeRange} | Généré le: ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, yOffset, { align: 'center' });
  
  yOffset += 15;

  // Summary statistics
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Statistiques Générales', 15, yOffset);
  yOffset += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const summaryStats = [
    `Total Appels: ${stats.totalCalls} (${stats.audioCallsCount} audio, ${stats.videoCallsCount} vidéo)`,
    `Durée Moyenne: ${formatDuration(stats.avgDuration)}`,
    `Taux de Réussite: ${stats.successRate}%`,
    `Note Qualité: ${stats.qualityMetrics.avgRating.toFixed(2)}/5 (${stats.qualityMetrics.totalFeedbacks} feedbacks)`,
  ];

  summaryStats.forEach(stat => {
    pdf.text(stat, 15, yOffset);
    yOffset += 6;
  });

  yOffset += 10;

  // Quality breakdown
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Répartition Qualité', 15, yOffset);
  yOffset += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const qualityStats = [
    `Excellent (5★): ${stats.qualityMetrics.excellentCount}`,
    `Bon (4★): ${stats.qualityMetrics.goodCount}`,
    `Moyen (3★): ${stats.qualityMetrics.fairCount}`,
    `Faible (≤2★): ${stats.qualityMetrics.poorCount}`,
  ];

  qualityStats.forEach(stat => {
    pdf.text(stat, 15, yOffset);
    yOffset += 6;
  });

  // Capture charts
  const chartsContainer = document.getElementById(chartsContainerId);
  if (chartsContainer) {
    const chartElements = chartsContainer.querySelectorAll('.chart-capture');
    
    for (let i = 0; i < chartElements.length; i++) {
      const chartElement = chartElements[i] as HTMLElement;
      
      // Add new page if needed
      if (yOffset > pageHeight - 80) {
        pdf.addPage();
        yOffset = 20;
      }

      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add chart title if available
        const titleElement = chartElement.querySelector('[data-chart-title]');
        if (titleElement) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(titleElement.textContent || '', 15, yOffset);
          yOffset += 8;
        }
        
        pdf.addImage(imgData, 'PNG', 15, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 15;
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
  }

  // Detailed data tables
  if (yOffset > pageHeight - 80) {
    pdf.addPage();
    yOffset = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Données Détaillées', 15, yOffset);
  yOffset += 10;

  // Calls by status table
  pdf.setFontSize(11);
  pdf.text('Appels par Statut:', 15, yOffset);
  yOffset += 6;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  stats.callsByStatus.forEach(item => {
    pdf.text(`• ${item.status}: ${item.count} appels`, 20, yOffset);
    yOffset += 5;
  });

  // Save PDF
  const fileName = `analytics-appels-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
