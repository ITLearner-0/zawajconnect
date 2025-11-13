import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import type { WaliAlert, WaliActivity } from '@/hooks/wali/useWaliMonitoring';

/**
 * Export Wali registrations to Excel
 */
export const exportWaliRegistrationsToExcel = (registrations: WaliRegistration[]) => {
  const data = registrations.map((reg) => ({
    'ID': reg.id,
    'Nom Complet': reg.full_name,
    'Email': reg.email,
    'Téléphone': reg.phone || 'N/A',
    'Relation': reg.relationship_to_user,
    'Statut': getStatusLabel(reg.status),
    'Document ID': reg.id_document_url ? 'Oui' : 'Non',
    'Document Preuve': reg.proof_of_relationship_url ? 'Oui' : 'Non',
    'Notes': reg.verification_notes || '',
    'Raison Rejet': reg.rejection_reason || '',
    'Créé le': format(new Date(reg.created_at), 'PPP à HH:mm', { locale: fr }),
    'Vérifié le': reg.verified_at
      ? format(new Date(reg.verified_at), 'PPP à HH:mm', { locale: fr })
      : 'N/A',
    'Vérifié par': reg.verified_by || 'N/A',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inscriptions Wali');

  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 10);
  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: Math.min(maxWidth, 50) }));

  const fileName = `inscriptions-wali-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export Wali registrations to CSV
 */
export const exportWaliRegistrationsToCSV = (registrations: WaliRegistration[]) => {
  const data = registrations.map((reg) => ({
    'ID': reg.id,
    'Nom Complet': reg.full_name,
    'Email': reg.email,
    'Téléphone': reg.phone || 'N/A',
    'Relation': reg.relationship_to_user,
    'Statut': getStatusLabel(reg.status),
    'Document ID': reg.id_document_url ? 'Oui' : 'Non',
    'Document Preuve': reg.proof_of_relationship_url ? 'Oui' : 'Non',
    'Notes': reg.verification_notes || '',
    'Raison Rejet': reg.rejection_reason || '',
    'Créé le': format(new Date(reg.created_at), 'PPP à HH:mm', { locale: fr }),
    'Vérifié le': reg.verified_at
      ? format(new Date(reg.verified_at), 'PPP à HH:mm', { locale: fr })
      : 'N/A',
    'Vérifié par': reg.verified_by || 'N/A',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inscriptions-wali-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export Wali alerts to Excel
 */
export const exportWaliAlertsToExcel = (alerts: WaliAlert[]) => {
  const data = alerts.map((alert) => ({
    'ID': alert.id,
    'ID Wali': alert.wali_user_id,
    'Type Alerte': alert.alert_type,
    'Niveau Risque': getRiskLabel(alert.risk_level),
    'Description': alert.description,
    'Confirmée': alert.acknowledged ? 'Oui' : 'Non',
    'Confirmée par': alert.acknowledged_by || 'N/A',
    'Confirmée le': alert.acknowledged_at
      ? format(new Date(alert.acknowledged_at), 'PPP à HH:mm', { locale: fr })
      : 'N/A',
    'Créée le': format(new Date(alert.created_at), 'PPP à HH:mm', { locale: fr }),
    'Métadonnées': JSON.stringify(alert.metadata),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Alertes Wali');

  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 30 }));

  const fileName = `alertes-wali-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export Wali alerts to CSV
 */
export const exportWaliAlertsToCSV = (alerts: WaliAlert[]) => {
  const data = alerts.map((alert) => ({
    'ID': alert.id,
    'ID Wali': alert.wali_user_id,
    'Type Alerte': alert.alert_type,
    'Niveau Risque': getRiskLabel(alert.risk_level),
    'Description': alert.description,
    'Confirmée': alert.acknowledged ? 'Oui' : 'Non',
    'Confirmée par': alert.acknowledged_by || 'N/A',
    'Confirmée le': alert.acknowledged_at
      ? format(new Date(alert.acknowledged_at), 'PPP à HH:mm', { locale: fr })
      : 'N/A',
    'Créée le': format(new Date(alert.created_at), 'PPP à HH:mm', { locale: fr }),
    'Métadonnées': JSON.stringify(alert.metadata),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `alertes-wali-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export Wali activities to Excel
 */
export const exportWaliActivitiesToExcel = (activities: WaliActivity[]) => {
  const data = activities.map((activity) => ({
    'ID Wali': activity.wali_user_id,
    'Nom': activity.full_name,
    'Total Actions': activity.total_actions,
    'Actions Suspectes': activity.suspicious_actions,
    'Score Risque': activity.risk_score,
    'Niveau Risque': getRiskLabelFromScore(activity.risk_score),
    'Dernière Activité': format(new Date(activity.last_activity), 'PPP à HH:mm', {
      locale: fr,
    }),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Activités Wali');

  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 25 }));

  const fileName = `activites-wali-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export comprehensive Wali report with multiple sheets
 */
export const exportComprehensiveWaliReport = (
  registrations: WaliRegistration[],
  alerts: WaliAlert[],
  activities: WaliActivity[]
) => {
  const wb = XLSX.utils.book_new();

  // Registrations sheet
  const regData = registrations.map((reg) => ({
    'ID': reg.id,
    'Nom Complet': reg.full_name,
    'Email': reg.email,
    'Statut': getStatusLabel(reg.status),
    'Créé le': format(new Date(reg.created_at), 'dd/MM/yyyy HH:mm'),
  }));
  const wsReg = XLSX.utils.json_to_sheet(regData);
  XLSX.utils.book_append_sheet(wb, wsReg, 'Inscriptions');

  // Alerts sheet
  const alertData = alerts.map((alert) => ({
    'Type': alert.alert_type,
    'Risque': getRiskLabel(alert.risk_level),
    'Description': alert.description,
    'Confirmée': alert.acknowledged ? 'Oui' : 'Non',
    'Date': format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm'),
  }));
  const wsAlert = XLSX.utils.json_to_sheet(alertData);
  XLSX.utils.book_append_sheet(wb, wsAlert, 'Alertes');

  // Activities sheet
  const actData = activities.map((activity) => ({
    'Nom': activity.full_name,
    'Actions': activity.total_actions,
    'Suspectes': activity.suspicious_actions,
    'Score': activity.risk_score,
    'Dernière Activité': format(new Date(activity.last_activity), 'dd/MM/yyyy HH:mm'),
  }));
  const wsAct = XLSX.utils.json_to_sheet(actData);
  XLSX.utils.book_append_sheet(wb, wsAct, 'Activités');

  // Summary sheet
  const summary = [
    { Statistique: 'Total Inscriptions', Valeur: registrations.length },
    {
      Statistique: 'Inscriptions Approuvées',
      Valeur: registrations.filter((r) => r.status === 'approved').length,
    },
    {
      Statistique: 'Inscriptions En Attente',
      Valeur: registrations.filter((r) => r.status === 'pending').length,
    },
    {
      Statistique: 'Inscriptions Rejetées',
      Valeur: registrations.filter((r) => r.status === 'rejected').length,
    },
    { Statistique: 'Total Alertes', Valeur: alerts.length },
    {
      Statistique: 'Alertes Critiques',
      Valeur: alerts.filter((a) => a.risk_level === 'critical').length,
    },
    {
      Statistique: 'Alertes Non Confirmées',
      Valeur: alerts.filter((a) => !a.acknowledged).length,
    },
    { Statistique: 'Walis Actifs', Valeur: activities.length },
    {
      Statistique: 'Walis à Risque Élevé',
      Valeur: activities.filter((a) => a.risk_score >= 20).length,
    },
    {
      Statistique: 'Date Rapport',
      Valeur: format(new Date(), 'PPP à HH:mm', { locale: fr }),
    },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

  const fileName = `rapport-wali-complet-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Helper functions
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'En Attente';
    case 'verified':
      return 'Vérifié';
    case 'approved':
      return 'Approuvé';
    case 'rejected':
      return 'Rejeté';
    default:
      return status;
  }
};

const getRiskLabel = (level: string) => {
  switch (level) {
    case 'critical':
      return 'Critique';
    case 'high':
      return 'Élevé';
    case 'medium':
      return 'Moyen';
    case 'low':
      return 'Faible';
    default:
      return level;
  }
};

const getRiskLabelFromScore = (score: number) => {
  if (score >= 20) return 'Risque Élevé';
  if (score >= 10) return 'Risque Moyen';
  if (score >= 5) return 'Risque Faible';
  return 'Normal';
};
