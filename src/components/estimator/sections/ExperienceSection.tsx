import { Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from '@/components/ui/drawer';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { ProjectFormData, TeamComposition, ExperienceLevel, DEFAULT_HOURLY_RATES, getTotalTeamCount } from '@/types/estimator';
import { TeamRoleCounter } from '../TeamRoleCounter';
import { TeamSummaryCard } from '../TeamSummaryCard';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ExperienceSectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const ROLE_LABELS: Record<ExperienceLevel, string> = {
  junior: 'Junior Developer',
  mid: 'Mid-Level Developer',
  senior: 'Senior Developer',
  lead: 'Tech Lead',
  architect: 'Architect',
};

export function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  const isMobile = useIsMobile();
  const [showAddCustomRole, setShowAddCustomRole] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleRate, setCustomRoleRate] = useState('80');

  const teamComposition = data.teamComposition;
  const totalCount = getTotalTeamCount(teamComposition);

  const handleRoleCountChange = (role: ExperienceLevel, count: number) => {
    onChange({
      teamComposition: {
        ...teamComposition,
        [role]: { ...teamComposition[role], count },
      },
    });
  };

  const handleRoleRateChange = (role: ExperienceLevel, hourlyRate: number) => {
    onChange({
      teamComposition: {
        ...teamComposition,
        [role]: { ...teamComposition[role], hourlyRate },
      },
    });
  };

  const handleRoleExperienceChange = (role: ExperienceLevel, customExperience: string) => {
    onChange({
      teamComposition: {
        ...teamComposition,
        [role]: { ...teamComposition[role], customExperience },
      },
    });
  };

  const handleAddCustomRole = () => {
    if (!customRoleName.trim()) return;
    
    const newRole = {
      id: crypto.randomUUID(),
      name: customRoleName.trim(),
      count: 1,
      hourlyRate: parseInt(customRoleRate) || 80,
    };
    
    onChange({
      teamComposition: {
        ...teamComposition,
        customRoles: [...teamComposition.customRoles, newRole],
      },
    });
    
    setCustomRoleName('');
    setCustomRoleRate('80');
    setShowAddCustomRole(false);
  };

  const handleRemoveCustomRole = (id: string) => {
    onChange({
      teamComposition: {
        ...teamComposition,
        customRoles: teamComposition.customRoles.filter(r => r.id !== id),
      },
    });
  };

  const handleCustomRoleCountChange = (id: string, count: number) => {
    onChange({
      teamComposition: {
        ...teamComposition,
        customRoles: teamComposition.customRoles.map(r =>
          r.id === id ? { ...r, count } : r
        ),
      },
    });
  };

  const handleCustomRoleRateChange = (id: string, hourlyRate: number) => {
    onChange({
      teamComposition: {
        ...teamComposition,
        customRoles: teamComposition.customRoles.map(r =>
          r.id === id ? { ...r, hourlyRate } : r
        ),
      },
    });
  };

  const TeamBuilderContent = () => (
    <div className="space-y-3">
      {/* Standard Roles */}
      {(Object.keys(ROLE_LABELS) as ExperienceLevel[]).map((role) => (
        <TeamRoleCounter
          key={role}
          label={ROLE_LABELS[role]}
          count={teamComposition[role].count}
          hourlyRate={teamComposition[role].hourlyRate}
          customExperience={teamComposition[role].customExperience}
          onCountChange={(count) => handleRoleCountChange(role, count)}
          onRateChange={(rate) => handleRoleRateChange(role, rate)}
          onExperienceChange={(exp) => handleRoleExperienceChange(role, exp)}
        />
      ))}

      {/* Custom Roles */}
      {teamComposition.customRoles.map((role) => (
        <div key={role.id} className="relative">
          <TeamRoleCounter
            label={role.name}
            count={role.count}
            hourlyRate={role.hourlyRate}
            onCountChange={(count) => handleCustomRoleCountChange(role.id, count)}
            onRateChange={(rate) => handleCustomRoleRateChange(role.id, rate)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20"
            onClick={() => handleRemoveCustomRole(role.id)}
          >
            <X className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}

      {/* Add Custom Role Button */}
      <Dialog open={showAddCustomRole} onOpenChange={setShowAddCustomRole}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Role
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Role</DialogTitle>
            <DialogDescription>
              Create a custom role with a specific hourly rate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Role Name</label>
              <Input
                value={customRoleName}
                onChange={(e) => setCustomRoleName(e.target.value)}
                placeholder="e.g., DevOps Engineer"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hourly Rate ($)</label>
              <Input
                type="number"
                value={customRoleRate}
                onChange={(e) => setCustomRoleRate(e.target.value)}
                min={1}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddCustomRole}>Add Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Team Builder</h3>
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 ? `${totalCount} team member${totalCount > 1 ? 's' : ''}` : 'Build your project team'}
            </p>
          </div>
        </div>

        {/* Mobile: Use Drawer */}
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Edit Team
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Team Builder</DrawerTitle>
                <DrawerDescription>
                  Configure your team members and their hourly rates.
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4 max-h-[60vh] overflow-auto">
                <TeamBuilderContent />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : null}
      </div>

      {/* Desktop: Show inline */}
      {!isMobile && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <TeamBuilderContent />
          </div>
          <div>
            <TeamSummaryCard teamComposition={teamComposition} />
          </div>
        </div>
      )}

      {/* Mobile: Show summary card */}
      {isMobile && (
        <TeamSummaryCard teamComposition={teamComposition} />
      )}
    </section>
  );
}