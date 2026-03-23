import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }}>
              <span className="text-4xl font-bold text-white">404</span>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Page Introuvable</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
