import { useState, useMemo } from 'react';
import { Users, Plus, Trash2, CheckCircle, XCircle, AlertCircle, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_TECHNOLOGIES } from '@/types/estimator';

interface TeamMember {
  id: string;
  name: string;
  role: 'frontend' | 'backend' | 'fullstack' | 'qa' | 'devops' | 'pm' | 'designer';
  skills: string[];
  proficiency: Record<string, 'beginner' | 'intermediate' | 'expert'>;
}

interface TeamSkillMatrixProps {
  requiredTechnologies: string[];
  onSkillGapsChange?: (gaps: string[]) => void;
}

const ALL_TECHNOLOGIES = [
  ...AVAILABLE_TECHNOLOGIES.frontend,
  ...AVAILABLE_TECHNOLOGIES.backend,
  ...AVAILABLE_TECHNOLOGIES.database,
  ...AVAILABLE_TECHNOLOGIES.cloud,
  ...AVAILABLE_TECHNOLOGIES.tools,
];

const ROLE_LABELS = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  fullstack: 'Full Stack Developer',
  qa: 'QA Engineer',
  devops: 'DevOps Engineer',
  pm: 'Project Manager',
  designer: 'Designer',
};

const PROFICIENCY_COLORS = {
  beginner: 'bg-yellow-500/20 text-yellow-700',
  intermediate: 'bg-blue-500/20 text-blue-700',
  expert: 'bg-green-500/20 text-green-700',
};

export function TeamSkillMatrix({ requiredTechnologies, onSkillGapsChange }: TeamSkillMatrixProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('fullstack');
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const addTeamMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      skills: [],
      proficiency: {},
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setEditingMember(newMember.id);
  };

  const removeMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    if (editingMember === id) setEditingMember(null);
  };

  const toggleSkill = (memberId: string, skill: string) => {
    setTeamMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const hasSkill = m.skills.includes(skill);
      return {
        ...m,
        skills: hasSkill ? m.skills.filter(s => s !== skill) : [...m.skills, skill],
        proficiency: hasSkill 
          ? Object.fromEntries(Object.entries(m.proficiency).filter(([k]) => k !== skill))
          : { ...m.proficiency, [skill]: 'intermediate' as const },
      };
    }));
  };

  const setProficiency = (memberId: string, skill: string, level: 'beginner' | 'intermediate' | 'expert') => {
    setTeamMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        proficiency: { ...m.proficiency, [skill]: level },
      };
    }));
  };

  // Calculate skill coverage
  const skillAnalysis = useMemo(() => {
    const allTeamSkills = new Set(teamMembers.flatMap(m => m.skills));
    const covered = requiredTechnologies.filter(t => allTeamSkills.has(t));
    const gaps = requiredTechnologies.filter(t => !allTeamSkills.has(t));
    
    // Calculate coverage by proficiency
    const expertCoverage = requiredTechnologies.filter(t => 
      teamMembers.some(m => m.skills.includes(t) && m.proficiency[t] === 'expert')
    );
    
    const coveragePercentage = requiredTechnologies.length > 0 
      ? Math.round((covered.length / requiredTechnologies.length) * 100)
      : 100;

    const expertPercentage = requiredTechnologies.length > 0
      ? Math.round((expertCoverage.length / requiredTechnologies.length) * 100)
      : 100;

    onSkillGapsChange?.(gaps);

    return { covered, gaps, coveragePercentage, expertPercentage, expertCoverage };
  }, [teamMembers, requiredTechnologies, onSkillGapsChange]);

  return (
    <Card className="border-2 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Team Skill Matrix
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Skill Coverage:</span>
            <Badge className={skillAnalysis.coveragePercentage === 100 ? 'bg-green-500' : 'bg-yellow-500'}>
              {skillAnalysis.coveragePercentage}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Team Member */}
        <div className="flex gap-3">
          <Input
            placeholder="Team member name..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="flex-1"
          />
          <Select value={newMemberRole} onValueChange={(v: TeamMember['role']) => setNewMemberRole(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addTeamMember} disabled={!newMemberName.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Team Members List */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Add team members to analyze skill coverage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="p-4 bg-muted/50 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{ROLE_LABELS[member.role]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                    >
                      {editingMember === member.id ? 'Done' : 'Edit Skills'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeMember(member.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Skills Display */}
                <div className="flex flex-wrap gap-2">
                  {member.skills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No skills added yet</span>
                  ) : (
                    member.skills.map(skill => (
                      <Badge 
                        key={skill} 
                        className={PROFICIENCY_COLORS[member.proficiency[skill] || 'intermediate']}
                      >
                        {skill}
                        {editingMember === member.id && (
                          <select
                            className="ml-2 bg-transparent border-none text-xs"
                            value={member.proficiency[skill] || 'intermediate'}
                            onChange={(e) => setProficiency(member.id, skill, e.target.value as any)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                          </select>
                        )}
                      </Badge>
                    ))
                  )}
                </div>

                {/* Skill Editor */}
                {editingMember === member.id && (
                  <div className="mt-4 p-3 bg-background rounded border">
                    <h5 className="text-sm font-semibold mb-2">Select Skills</h5>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {ALL_TECHNOLOGIES.map(tech => (
                        <Badge
                          key={tech}
                          variant={member.skills.includes(tech) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleSkill(member.id, tech)}
                        >
                          {tech}
                          {member.skills.includes(tech) && <CheckCircle className="w-3 h-3 ml-1" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skill Coverage Analysis */}
        {requiredTechnologies.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Required Technologies Coverage
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Covered Skills */}
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-700">Covered ({skillAnalysis.covered.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skillAnalysis.covered.map(tech => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                      {skillAnalysis.expertCoverage.includes(tech) && (
                        <span className="ml-1 text-green-500">★</span>
                      )}
                    </Badge>
                  ))}
                  {skillAnalysis.covered.length === 0 && (
                    <span className="text-sm text-muted-foreground">No technologies covered yet</span>
                  )}
                </div>
              </div>

              {/* Skill Gaps */}
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-red-700">Gaps ({skillAnalysis.gaps.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skillAnalysis.gaps.map(tech => (
                    <Badge key={tech} variant="destructive" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {skillAnalysis.gaps.length === 0 && (
                    <span className="text-sm text-green-600">All required skills covered!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {skillAnalysis.gaps.length > 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-yellow-700">Recommendations</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Consider hiring or contracting for: {skillAnalysis.gaps.slice(0, 3).join(', ')}</li>
                      <li>• Plan training sessions for existing team members</li>
                      <li>• Evaluate if alternative technologies could be used</li>
                      {skillAnalysis.gaps.length > 3 && (
                        <li>• Note: {skillAnalysis.gaps.length - 3} additional skill gaps identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Proficiency Legend */}
        <div className="flex items-center gap-4 text-sm border-t pt-4">
          <span className="text-muted-foreground">Proficiency:</span>
          <Badge className={PROFICIENCY_COLORS.beginner}>Beginner</Badge>
          <Badge className={PROFICIENCY_COLORS.intermediate}>Intermediate</Badge>
          <Badge className={PROFICIENCY_COLORS.expert}>Expert ★</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
