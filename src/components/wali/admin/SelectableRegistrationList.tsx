import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye } from 'lucide-react';
import { RegistrationStatusBadge } from '../registration/RegistrationStatusBadge';

interface SelectableRegistrationListProps {
  registrations: WaliRegistration[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onViewDetails: (registration: WaliRegistration) => void;
}

export const SelectableRegistrationList = ({
  registrations,
  selectedIds,
  onToggleSelect,
  onViewDetails,
}: SelectableRegistrationListProps) => {
  if (registrations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">Aucune inscription trouvée</div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Relation</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(registration.id)}
                  onCheckedChange={() => onToggleSelect(registration.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{registration.full_name}</TableCell>
              <TableCell>{registration.email}</TableCell>
              <TableCell>{registration.phone || '-'}</TableCell>
              <TableCell>{registration.relationship_to_user}</TableCell>
              <TableCell>{new Date(registration.created_at).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>
                <RegistrationStatusBadge status={registration.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onViewDetails(registration)}>
                  <Eye className="h-3 w-3 mr-2" />
                  Voir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
