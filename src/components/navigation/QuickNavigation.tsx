import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getNavigationRoutes } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const QuickNavigation = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWali } = useUserRole();
  const { isAdmin } = useIsAdmin();

  const allRoutes = getNavigationRoutes();
  
  // Filter routes based on user role
  const availableRoutes = allRoutes.filter(route => {
    if (!route.roles) return true;
    
    if (route.roles.includes('admin') && !isAdmin) return false;
    if (route.roles.includes('wali') && !isWali && !isAdmin) return false;
    
    return true;
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(open => !open);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  if (!user) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 hidden lg:flex"
      >
        <Search className="h-4 w-4" />
        Navigation rapide
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucune page trouvée.</CommandEmpty>
          
          <CommandGroup heading="Navigation principale">
            {availableRoutes
              .filter(route => route.category === 'main')
              .map((route) => (
                <CommandItem
                  key={route.path}
                  onSelect={() => handleSelect(route.path)}
                  className="flex items-center gap-2"
                >
                  {route.icon && (
                    <span className="h-4 w-4">
                      {/* Icon would be rendered here */}
                    </span>
                  )}
                  <span>{route.label}</span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Matching & Compatibilité">
            {availableRoutes
              .filter(route => route.category === 'matching')
              .map((route) => (
                <CommandItem
                  key={route.path}
                  onSelect={() => handleSelect(route.path)}
                  className="flex items-center gap-2"
                >
                  <span>{route.label}</span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Outils Islamiques">
            {availableRoutes
              .filter(route => route.category === 'tools')
              .map((route) => (
                <CommandItem
                  key={route.path}
                  onSelect={() => handleSelect(route.path)}
                  className="flex items-center gap-2"
                >
                  <span>{route.label}</span>
                </CommandItem>
              ))}
          </CommandGroup>

          {(isWali || isAdmin) && (
            <CommandGroup heading="Supervision Familiale">
              {availableRoutes
                .filter(route => route.category === 'family')
                .map((route) => (
                  <CommandItem
                    key={route.path}
                    onSelect={() => handleSelect(route.path)}
                    className="flex items-center gap-2"
                  >
                    <span>{route.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {isAdmin && (
            <CommandGroup heading="Administration">
              {availableRoutes
                .filter(route => route.category === 'admin')
                .map((route) => (
                  <CommandItem
                    key={route.path}
                    onSelect={() => handleSelect(route.path)}
                    className="flex items-center gap-2"
                  >
                    <span>{route.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default QuickNavigation;