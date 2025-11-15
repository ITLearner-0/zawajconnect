import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportActionsProps {
  registrations: WaliRegistration[];
  selectedIds?: string[];
}

export const ExportActions = ({ registrations, selectedIds }: ExportActionsProps) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const dataToExport = selectedIds && selectedIds.length > 0
    ? registrations.filter((r) => selectedIds.includes(r.id))
    : registrations;

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Nom', 'Email', 'Téléphone', 'Relation', 'Statut', 'Date de soumission'];
      const rows = dataToExport.map((reg) => [
        reg.full_name,
        reg.email,
        reg.phone || 'N/A',
        reg.relationship_to_user,
        reg.status,
        new Date(reg.submitted_at).toLocaleDateString('fr-FR'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `wali_registrations_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: 'Export réussi',
        description: `${dataToExport.length} inscriptions exportées en CSV`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'export CSV",
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Inscriptions Wali', 14, 20);

      doc.setFontSize(11);
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 28);
      doc.text(`Total: ${dataToExport.length} inscription(s)`, 14, 34);

      // Table
      const headers = [['Nom', 'Email', 'Téléphone', 'Relation', 'Statut', 'Date']];
      const rows = dataToExport.map((reg) => [
        reg.full_name,
        reg.email,
        reg.phone || 'N/A',
        reg.relationship_to_user,
        reg.status,
        new Date(reg.submitted_at).toLocaleDateString('fr-FR'),
      ]);

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`wali_registrations_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Export réussi',
        description: `${dataToExport.length} inscriptions exportées en PDF`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'export PDF",
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting || dataToExport.length === 0}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exporter {selectedIds && selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter en CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
