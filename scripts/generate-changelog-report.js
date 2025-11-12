#!/usr/bin/env node

/**
 * Script de génération automatique de rapport de modifications
 * Analyse les fichiers de documentation et génère un rapport consolidé
 */

const fs = require('fs');
const path = require('path');

// Fichiers de documentation à analyser
const DOC_FILES = [
  'SECURITY_FIXES_APPLIED.md',
  'SMTP_CONFIGURATION.md',
  'CRON_JOBS_SETUP.md',
  'BRAINTREE_SETUP_GUIDE.md',
  'CODE_REVIEW_SUMMARY.md',
  'COMPETITOR_PAYMENT_RESEARCH.md',
  'DEPLOYMENT_GUIDE.md',
  'EMAIL_INTEGRATION_GUIDE.md',
  'MIGRATION_COMPLETE_SMTP.md',
  'WORKFLOW_ANALYSIS.md',
];

// Catégories de modifications
const CATEGORIES = {
  security: ['SECURITY', 'JWT', 'RATE LIMIT', 'VALIDATION', 'RLS'],
  infrastructure: ['SMTP', 'EMAIL', 'CRON', 'DEPLOYMENT', 'MIGRATION'],
  payment: ['BRAINTREE', 'STRIPE', 'PAYMENT', 'SUBSCRIPTION'],
  workflow: ['WORKFLOW', 'PROCESS', 'AUTOMATION'],
};

/**
 * Lit un fichier de documentation
 */
function readDocFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      return {
        filename,
        content,
        lastModified: stats.mtime,
        exists: true,
      };
    }
  } catch (error) {
    console.warn(`⚠️  Impossible de lire ${filename}: ${error.message}`);
  }
  return { filename, exists: false };
}

/**
 * Catégorise un fichier selon son contenu
 */
function categorizeFile(fileData) {
  const content = fileData.content.toUpperCase();
  const categories = [];

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['other'];
}

/**
 * Extrait un résumé du fichier (premiers paragraphes)
 */
function extractSummary(content, maxLength = 300) {
  // Enlever les titres markdown
  const withoutTitles = content.replace(/^#+\s+.+$/gm, '');

  // Prendre le premier paragraphe non vide
  const paragraphs = withoutTitles
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 50);

  if (paragraphs.length === 0) return 'Aucun résumé disponible';

  const summary = paragraphs[0];
  return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
}

/**
 * Génère le rapport en Markdown
 */
function generateMarkdownReport(filesData) {
  const timestamp = new Date().toISOString();
  const reportDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let report = `# 📊 Rapport des Modifications du Projet\n\n`;
  report += `**Généré le:** ${reportDate}\n\n`;
  report += `---\n\n`;

  // Statistiques générales
  const existingFiles = filesData.filter((f) => f.exists);
  report += `## 📈 Statistiques\n\n`;
  report += `- **Fichiers analysés:** ${existingFiles.length}/${filesData.length}\n`;
  report += `- **Dernière modification:** ${new Date(Math.max(...existingFiles.map((f) => f.lastModified))).toLocaleDateString('fr-FR')}\n\n`;

  // Grouper par catégorie
  const categorized = {};
  existingFiles.forEach((file) => {
    const categories = categorizeFile(file);
    categories.forEach((cat) => {
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(file);
    });
  });

  // Rapport par catégorie
  report += `## 🗂️ Modifications par Catégorie\n\n`;

  const categoryIcons = {
    security: '🔒',
    infrastructure: '⚙️',
    payment: '💳',
    workflow: '🔄',
    other: '📄',
  };

  const categoryNames = {
    security: 'Sécurité',
    infrastructure: 'Infrastructure',
    payment: 'Paiements',
    workflow: 'Workflows',
    other: 'Autres',
  };

  for (const [category, files] of Object.entries(categorized)) {
    const icon = categoryIcons[category] || '📄';
    const name = categoryNames[category] || category;

    report += `### ${icon} ${name} (${files.length} fichier${files.length > 1 ? 's' : ''})\n\n`;

    files.forEach((file) => {
      report += `#### 📝 ${file.filename}\n\n`;
      report += `- **Modifié le:** ${file.lastModified.toLocaleDateString('fr-FR')}\n`;
      report += `- **Résumé:** ${extractSummary(file.content)}\n\n`;
    });
  }

  // Section des fichiers détaillés
  report += `---\n\n## 📋 Détails Complets\n\n`;

  existingFiles
    .sort((a, b) => b.lastModified - a.lastModified)
    .forEach((file) => {
      report += `### ${file.filename}\n\n`;
      report += `\`\`\`\n${file.content}\n\`\`\`\n\n`;
      report += `---\n\n`;
    });

  // Footer
  report += `\n\n---\n`;
  report += `*Rapport généré automatiquement par scripts/generate-changelog-report.js*\n`;
  report += `*Timestamp: ${timestamp}*\n`;

  return report;
}

/**
 * Génère le rapport en HTML
 */
function generateHtmlReport(filesData) {
  const reportDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const existingFiles = filesData.filter((f) => f.exists);

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des Modifications - Zawaj Connect</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .content { padding: 40px; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-card h3 { font-size: 2rem; margin-bottom: 5px; }
        .stat-card p { opacity: 0.9; }
        .category {
            margin-bottom: 40px;
            border-left: 4px solid #667eea;
            padding-left: 20px;
        }
        .category h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        .file-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
        }
        .file-card h3 {
            color: #495057;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .file-card .meta {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        .file-card .summary {
            color: #495057;
            line-height: 1.6;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 0.9rem;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Rapport des Modifications</h1>
            <p>Zawaj Connect - Analyse Complète du Projet</p>
            <p>${reportDate}</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <h3>${existingFiles.length}</h3>
                    <p>Fichiers Analysés</p>
                </div>
                <div class="stat-card">
                    <h3>${DOC_FILES.length}</h3>
                    <p>Total Documents</p>
                </div>
            </div>
`;

  // Grouper par catégorie
  const categorized = {};
  existingFiles.forEach((file) => {
    const categories = categorizeFile(file);
    categories.forEach((cat) => {
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(file);
    });
  });

  const categoryNames = {
    security: '🔒 Sécurité',
    infrastructure: '⚙️ Infrastructure',
    payment: '💳 Paiements',
    workflow: '🔄 Workflows',
    other: '📄 Autres',
  };

  for (const [category, files] of Object.entries(categorized)) {
    const name = categoryNames[category] || category;

    html += `
            <div class="category">
                <h2>${name}</h2>
`;

    files.forEach((file) => {
      html += `
                <div class="file-card">
                    <h3>📝 ${file.filename}</h3>
                    <div class="meta">Modifié le: ${file.lastModified.toLocaleDateString('fr-FR')}</div>
                    <div class="summary">${extractSummary(file.content, 200)}</div>
                </div>
`;
    });

    html += `
            </div>
`;
  }

  html += `
        </div>
        
        <div class="footer">
            <p>Rapport généré automatiquement par scripts/generate-changelog-report.js</p>
            <p>Zawaj Connect © ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`;

  return html;
}

/**
 * Fonction principale
 */
function main() {
  console.log('🚀 Génération du rapport de modifications...\n');

  // Lire tous les fichiers
  const filesData = DOC_FILES.map(readDocFile);
  const existingFiles = filesData.filter((f) => f.exists);

  console.log(`📄 Fichiers trouvés: ${existingFiles.length}/${DOC_FILES.length}\n`);

  // Générer les rapports
  const markdownReport = generateMarkdownReport(filesData);
  const htmlReport = generateHtmlReport(filesData);

  // Créer le dossier reports s'il n'existe pas
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Sauvegarder les rapports
  const timestamp = new Date().toISOString().split('T')[0];
  const mdPath = path.join(reportsDir, `changelog-report-${timestamp}.md`);
  const htmlPath = path.join(reportsDir, `changelog-report-${timestamp}.html`);

  fs.writeFileSync(mdPath, markdownReport, 'utf-8');
  fs.writeFileSync(htmlPath, htmlReport, 'utf-8');

  console.log('✅ Rapports générés avec succès!\n');
  console.log(`📝 Markdown: ${mdPath}`);
  console.log(`🌐 HTML: ${htmlPath}\n`);
  console.log('💡 Ouvrez le fichier HTML dans votre navigateur pour une vue interactive.');
}

// Exécuter le script
main();
