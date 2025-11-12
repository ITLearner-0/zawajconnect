// Custom error types for better error handling
export class CompatibilityServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'CompatibilityServiceError';
  }
}

export class UserNotFoundError extends CompatibilityServiceError {
  constructor() {
    super("Vous devez d'abord passer le test de compatibilité", 'USER_RESULTS_NOT_FOUND');
  }
}

export class DatabaseConnectionError extends CompatibilityServiceError {
  constructor(operation: string, originalError: Error) {
    super(
      `Erreur de connexion à la base de données lors de: ${operation}`,
      'DATABASE_ERROR',
      originalError
    );
  }
}

export class NoMatchesFoundError extends CompatibilityServiceError {
  constructor() {
    super('Aucune correspondance trouvée', 'NO_MATCHES_FOUND');
  }
}
