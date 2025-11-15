/**
 * Script de déploiement automatique vers Hostinger via FTP
 *
 * Usage: npm run deploy:hostinger
 *
 * Configuration requise: Créer un fichier .ftp-deploy.json à la racine
 * (voir .ftp-deploy.example.json pour un exemple)
 */

const FtpDeploy = require('ftp-deploy');
const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
};

async function deploy() {
  const ftpDeploy = new FtpDeploy();
  const configPath = path.join(process.cwd(), '.ftp-deploy.json');

  // Vérifier si le fichier de configuration existe
  if (!fs.existsSync(configPath)) {
    log.error('Fichier de configuration .ftp-deploy.json introuvable !');
    log.info('Créez un fichier .ftp-deploy.json à partir de .ftp-deploy.example.json');
    log.info('Voir la documentation dans HOSTINGER_DEPLOY.md');
    process.exit(1);
  }

  // Charger la configuration
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    log.error(`Erreur de lecture de la configuration: ${error.message}`);
    process.exit(1);
  }

  // Valider la configuration
  const requiredFields = ['host', 'user', 'password', 'remoteRoot'];
  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    log.error(`Champs manquants dans .ftp-deploy.json: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  // Vérifier que le build existe
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    log.error("Le dossier dist/ n'existe pas !");
    log.info("Exécutez d'abord: npm run build");
    process.exit(1);
  }

  // Configuration FTP
  const ftpConfig = {
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port || 21,
    localRoot: distPath,
    remoteRoot: config.remoteRoot,
    include: ['*', '**/*'],
    exclude: config.exclude || ['**/*.map', 'node_modules/**', '.git/**', '.DS_Store'],
    deleteRemote: config.deleteRemote !== false, // Par défaut true
    forcePasv: true,
    sftp: false,
  };

  console.log('\n' + colors.bright + '🚀 Déploiement vers Hostinger' + colors.reset);
  console.log('─'.repeat(50));
  log.info(`Hôte: ${config.host}`);
  log.info(`Utilisateur: ${config.user}`);
  log.info(`Dossier distant: ${config.remoteRoot}`);
  log.info(`Dossier local: dist/`);
  console.log('─'.repeat(50) + '\n');

  try {
    log.step('Connexion au serveur FTP...');

    // Événements de progression
    ftpDeploy.on('uploading', (data) => {
      log.step(`Upload: ${data.filename} (${data.transferredFileCount}/${data.totalFilesCount})`);
    });

    ftpDeploy.on('uploaded', (data) => {
      log.success(`Uploaded: ${data.filename}`);
    });

    ftpDeploy.on('log', (data) => {
      if (data.includes('error') || data.includes('Error')) {
        log.error(data);
      }
    });

    // Déploiement
    await ftpDeploy.deploy(ftpConfig);

    console.log('\n' + '─'.repeat(50));
    log.success('🎉 Déploiement terminé avec succès !');

    if (config.siteUrl) {
      log.info(`Votre site: ${colors.bright}${config.siteUrl}${colors.reset}`);
    }

    console.log('─'.repeat(50) + '\n');
  } catch (error) {
    console.log('\n' + '─'.repeat(50));
    log.error('❌ Erreur lors du déploiement:');
    console.error(error.message);

    if (error.message.includes('ENOTFOUND')) {
      log.warn("Vérifiez votre connexion internet et l'hôte FTP");
    } else if (error.message.includes('530')) {
      log.warn('Identifiants FTP incorrects');
    } else if (error.message.includes('ECONNREFUSED')) {
      log.warn('Le serveur FTP a refusé la connexion - vérifiez le port');
    }

    console.log('─'.repeat(50) + '\n');
    process.exit(1);
  }
}

// Exécution
deploy();
