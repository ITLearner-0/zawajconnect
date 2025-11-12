const FtpDeploy = require('ftp-deploy');
const fs = require('fs');
const path = require('path');

// Colored console output
const log = {
  info: (msg) => console.log(`\x1b[36mℹ ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m✖ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`),
  step: (msg) => console.log(`\x1b[35m▶ ${msg}\x1b[0m`)
};

async function createBackup() {
  log.step('Creating backup of current deployment...');

  const configPath = path.join(__dirname, '..', '.ftp-deploy.json');
  
  if (!fs.existsSync(configPath)) {
    log.error('Configuration file not found: .ftp-deploy.json');
    log.info('Please create .ftp-deploy.json with your FTP credentials');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const ftpDeploy = new FtpDeploy();

  const ftpConfig = {
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port || 21,
    localRoot: path.join(__dirname, '..', 'backup'),
    remoteRoot: config.remoteRoot,
    include: ['*', '**/*'],
    exclude: config.exclude || [],
    deleteRemote: false,
    forcePasv: true,
    sftp: false
  };

  try {
    // Create backup directory
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    log.info('Downloading current version from Hostinger...');
    
    // Note: FTP-Deploy doesn't support downloading, so we'll use a different approach
    // This is a placeholder - in practice, you'd need to implement FTP download functionality
    log.warn('Backup creation requires FTP download capability');
    log.info('Consider using Git tags/releases for version management instead');
    
    log.success('Backup preparation completed');
  } catch (err) {
    log.error('Backup failed!');
    console.error(err);
    process.exit(1);
  }
}

async function rollback() {
  log.step('Rolling back to previous version...');

  const configPath = path.join(__dirname, '..', '.ftp-deploy.json');
  
  if (!fs.existsSync(configPath)) {
    log.error('Configuration file not found: .ftp-deploy.json');
    process.exit(1);
  }

  const backupDir = path.join(__dirname, '..', 'backup');
  if (!fs.existsSync(backupDir)) {
    log.error('Backup directory not found!');
    log.info('No backup available to rollback to');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const ftpDeploy = new FtpDeploy();

  const ftpConfig = {
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port || 21,
    localRoot: backupDir,
    remoteRoot: config.remoteRoot,
    include: ['*', '**/*'],
    exclude: [],
    deleteRemote: false,
    forcePasv: true,
    sftp: false
  };

  ftpDeploy.on('uploading', (data) => {
    log.info(`Restoring: ${data.filename}`);
  });

  ftpDeploy.on('uploaded', (data) => {
    log.success(`Restored: ${data.filename}`);
  });

  try {
    log.info('Connecting to FTP server...');
    await ftpDeploy.deploy(ftpConfig);
    
    log.success('✨ Rollback completed successfully!');
    log.info(`Site restored at: ${config.siteUrl || 'your Hostinger site'}`);
  } catch (err) {
    log.error('Rollback failed!');
    console.error(err);
    process.exit(1);
  }
}

// Parse command line arguments
const command = process.argv[2];

if (command === 'backup') {
  createBackup();
} else if (command === 'rollback') {
  rollback();
} else {
  log.error('Invalid command. Use: npm run rollback:backup or npm run rollback:restore');
  process.exit(1);
}
