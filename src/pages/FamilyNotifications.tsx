import React from 'react';
import FamilyNotificationCenter from '@/components/FamilyNotificationCenter';

const FamilyNotifications = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Notifications Familiales</h1>
          <p className="text-lg text-muted-foreground">
            Surveillance et notifications pour une communication conforme aux valeurs islamiques
          </p>
        </div>

        <FamilyNotificationCenter />
      </div>
    </div>
  );
};

export default FamilyNotifications;
