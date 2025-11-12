import React from 'react';
import { AppLayout } from '@/components/layout';
import ModerationDemo from '@/components/ModerationDemo';

const ModerationTest = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <ModerationDemo />
      </div>
    </AppLayout>
  );
};

export default ModerationTest;