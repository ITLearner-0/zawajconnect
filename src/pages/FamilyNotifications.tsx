import React from 'react';
import FamilyNotificationCenter from '@/components/FamilyNotificationCenter';

const FamilyNotifications = () => {
  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Notifications Familiales</h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Surveillance et notifications pour une communication conforme aux valeurs islamiques
          </p>
        </div>

        <FamilyNotificationCenter />
      </div>
    </div>
  );
};

export default FamilyNotifications;
