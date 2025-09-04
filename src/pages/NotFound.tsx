import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">404</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Page Introuvable
            </h1>
            <p className="text-muted-foreground">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              variant="gradient"
              onClick={() => navigate('/')}
              className="flex-1"
            >
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
