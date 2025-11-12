import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecurityDashboard from '@/components/enhanced/SecurityDashboard';
import FamilyDataProtection from '@/components/security/FamilyDataProtection';

const SecurityAdmin = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sécurité & Protection des données</h1>
        <p className="text-muted-foreground">
          Gérez la sécurité de votre compte et la protection des données familiales
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="family">Protection familiale</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          <FamilyDataProtection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityAdmin;