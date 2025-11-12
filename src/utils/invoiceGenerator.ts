/**
 * Invoice PDF Generator
 *
 * Generates downloadable PDF invoices for payments
 * Uses HTML to PDF conversion for compatibility
 */

interface InvoiceData {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  subscriptionId?: string;
  plan?: string;
  userEmail?: string;
  userName?: string;
}

/**
 * Generate and download invoice PDF
 * Uses print-to-PDF approach for browser compatibility
 */
export async function generateInvoicePDF(invoice: InvoiceData): Promise<void> {
  // Create invoice HTML
  const invoiceHTML = createInvoiceHTML(invoice);

  // Open in new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.');
  }

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  // Wait for content to load
  printWindow.onload = () => {
    // Trigger print dialog
    printWindow.print();

    // Close window after print (user can cancel print dialog)
    setTimeout(() => {
      printWindow.close();
    }, 100);
  };
}

/**
 * Create HTML invoice template
 */
function createInvoiceHTML(invoice: InvoiceData): string {
  const date = new Date(invoice.createdAt);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: invoice.currency.toUpperCase(),
  }).format(invoice.amount);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.paymentId}</title>
  <style>
    @media print {
      @page {
        margin: 0;
        size: A4;
      }
      body {
        margin: 1.6cm;
      }
      .no-print {
        display: none !important;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #10b981;
    }

    .company-info h1 {
      color: #10b981;
      font-size: 32px;
      margin-bottom: 5px;
    }

    .company-info p {
      color: #666;
      font-size: 14px;
    }

    .invoice-meta {
      text-align: right;
    }

    .invoice-meta h2 {
      font-size: 28px;
      color: #333;
      margin-bottom: 10px;
    }

    .invoice-meta p {
      color: #666;
      font-size: 14px;
      margin: 3px 0;
    }

    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .info-block h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }

    .info-block p {
      color: #333;
      font-size: 14px;
      margin: 3px 0;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }

    .invoice-table thead {
      background: #f9fafb;
    }

    .invoice-table th {
      text-align: left;
      padding: 15px;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }

    .invoice-table td {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }

    .invoice-table .amount {
      text-align: right;
      font-weight: 600;
    }

    .totals {
      margin-left: auto;
      width: 300px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }

    .totals-row.total {
      border-top: 2px solid #e5e7eb;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: 700;
      color: #10b981;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-failed {
      background: #fee2e2;
      color: #991b1b;
    }

    .no-print {
      margin-top: 20px;
      text-align: center;
    }

    .no-print button {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      margin: 0 5px;
    }

    .no-print button:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>ZawajConnect</h1>
        <p>Islamic Matrimonial Platform</p>
        <p>Paris, France</p>
        <p>contact@zawajconnect.com</p>
      </div>
      <div class="invoice-meta">
        <h2>FACTURE</h2>
        <p><strong>Numéro:</strong> #${invoice.paymentId.slice(0, 8).toUpperCase()}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p>
          <span class="status-badge status-${invoice.status.toLowerCase()}">
            ${translateStatus(invoice.status)}
          </span>
        </p>
      </div>
    </div>

    <div class="info-section">
      <div class="info-block">
        <h3>Facturé à</h3>
        <p><strong>${invoice.userName || 'Utilisateur'}</strong></p>
        <p>${invoice.userEmail || 'Email non disponible'}</p>
      </div>

      <div class="info-block">
        <h3>Détails de paiement</h3>
        <p><strong>ID Transaction:</strong> ${invoice.paymentId}</p>
        ${invoice.subscriptionId ? `<p><strong>Abonnement:</strong> ${invoice.subscriptionId.slice(0, 8)}</p>` : ''}
        <p><strong>Méthode:</strong> Carte bancaire</p>
      </div>
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Plan</th>
          <th class="amount">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Abonnement Premium ZawajConnect</td>
          <td>${invoice.plan || 'Premium'}</td>
          <td class="amount">${formattedAmount}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Sous-total:</span>
        <span>${formattedAmount}</span>
      </div>
      <div class="totals-row">
        <span>TVA (20%):</span>
        <span>${formatCurrency(invoice.amount * 0.2, invoice.currency)}</span>
      </div>
      <div class="totals-row total">
        <span>Total TTC:</span>
        <span>${formatCurrency(invoice.amount * 1.2, invoice.currency)}</span>
      </div>
    </div>

    <div class="footer">
      <p><strong>Merci pour votre confiance !</strong></p>
      <p>Cette facture a été générée automatiquement par ZawajConnect.</p>
      <p>Pour toute question, contactez-nous à support@zawajconnect.com</p>
      <p style="margin-top: 20px; font-size: 10px;">
        ZawajConnect - Plateforme matrimoniale islamique<br>
        SIRET: [À compléter] - TVA: [À compléter]
      </p>
    </div>

    <div class="no-print">
      <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
      <button onclick="window.close()" style="background: #6b7280;">Fermer</button>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Translate payment status to French
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    completed: 'Payé',
    pending: 'En attente',
    failed: 'Échoué',
    refunded: 'Remboursé',
  };
  return translations[status.toLowerCase()] || status;
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Alternative: Download as HTML file (fallback if print dialog doesn't work)
 */
export function downloadInvoiceHTML(invoice: InvoiceData): void {
  const html = createInvoiceHTML(invoice);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `facture-${invoice.paymentId.slice(0, 8)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
