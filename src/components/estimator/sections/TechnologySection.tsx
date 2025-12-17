import { Code, Check, Info } from 'lucide-react';
import { ProjectFormData, AVAILABLE_TECHNOLOGIES } from '@/types/estimator';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TechnologySectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

// Technology descriptions explaining what each tool does and how it helps
const TECHNOLOGY_DESCRIPTIONS: Record<string, { description: string; benefits: string }> = {
  // Frontend
  'React': { description: 'Component-based UI library by Meta', benefits: 'Fast development, reusable components, huge ecosystem' },
  'Vue.js': { description: 'Progressive JavaScript framework', benefits: 'Easy learning curve, flexible architecture, great docs' },
  'Angular': { description: 'Enterprise TypeScript framework by Google', benefits: 'Full-featured, strong typing, enterprise-ready' },
  'Next.js': { description: 'React framework with SSR/SSG', benefits: 'SEO-friendly, fast page loads, API routes built-in' },
  'Svelte': { description: 'Compile-time reactive framework', benefits: 'No virtual DOM, smaller bundle, faster runtime' },
  'TypeScript': { description: 'JavaScript with static typing', benefits: 'Catch bugs early, better IDE support, safer refactoring' },
  
  // Backend
  'Node.js': { description: 'JavaScript runtime for server-side', benefits: 'Same language frontend/backend, fast async I/O, NPM ecosystem' },
  'Python': { description: 'Versatile programming language', benefits: 'AI/ML libraries, rapid development, readable syntax' },
  'Java': { description: 'Enterprise-grade language', benefits: 'Battle-tested, strong typing, massive enterprise adoption' },
  'Go': { description: 'Fast compiled language by Google', benefits: 'High performance, simple syntax, great concurrency' },
  'Rust': { description: 'Systems language with safety guarantees', benefits: 'Memory safety, zero-cost abstractions, blazing fast' },
  '.NET': { description: 'Microsoft ecosystem framework', benefits: 'Enterprise integration, cross-platform, strong tooling' },
  
  // Database
  'PostgreSQL': { description: 'Advanced open-source SQL database', benefits: 'ACID compliant, JSON support, highly extensible' },
  'MongoDB': { description: 'Document-oriented NoSQL database', benefits: 'Flexible schema, horizontal scaling, JSON-native' },
  'MySQL': { description: 'Popular open-source SQL database', benefits: 'Reliable, widely supported, easy to use' },
  'Redis': { description: 'In-memory data structure store', benefits: 'Ultra-fast caching, pub/sub, session storage' },
  'Supabase': { description: 'Open-source Firebase alternative', benefits: 'Postgres + Auth + Storage + Realtime built-in' },
  'Firebase': { description: 'Google\'s app development platform', benefits: 'Realtime sync, easy auth, serverless functions' },
  
  // Cloud
  'AWS': { description: 'Amazon Web Services', benefits: 'Most services, global reach, enterprise features' },
  'Google Cloud': { description: 'Google Cloud Platform', benefits: 'AI/ML services, data analytics, Kubernetes origin' },
  'Azure': { description: 'Microsoft cloud platform', benefits: 'Enterprise integration, hybrid cloud, .NET native' },
  'Vercel': { description: 'Frontend cloud platform', benefits: 'Zero-config deploys, edge functions, Next.js native' },
  'Netlify': { description: 'Web hosting and serverless', benefits: 'Easy CI/CD, forms, identity management' },
  'Docker': { description: 'Container platform', benefits: 'Consistent environments, easy scaling, microservices' },
  
  // DevOps Tools
  'GitHub Actions': { description: 'CI/CD automation platform', benefits: 'Native GitHub integration, marketplace actions' },
  'Jenkins': { description: 'Open-source automation server', benefits: 'Highly customizable, plugin ecosystem, self-hosted' },
  'Terraform': { description: 'Infrastructure as Code tool', benefits: 'Multi-cloud, version-controlled infra, reproducible' },
  'Kubernetes': { description: 'Container orchestration platform', benefits: 'Auto-scaling, self-healing, declarative config' },
  'CircleCI': { description: 'Cloud-native CI/CD platform', benefits: 'Fast builds, parallelism, easy configuration' },
  'GitLab CI': { description: 'Integrated DevOps platform', benefits: 'All-in-one solution, built-in registry, security scanning' },
};

export function TechnologySection({ data, onChange }: TechnologySectionProps) {
  const toggleTechnology = (tech: string) => {
    const current = data.technologies || [];
    const updated = current.includes(tech)
      ? current.filter(t => t !== tech)
      : [...current, tech];
    onChange({ technologies: updated });
  };

  const categories = [
    { key: 'frontend', label: 'Frontend', description: 'Build your user interface' },
    { key: 'backend', label: 'Backend', description: 'Power your application logic' },
    { key: 'database', label: 'Database', description: 'Store and manage your data' },
    { key: 'cloud', label: 'Cloud', description: 'Host and scale your application' },
    { key: 'tools', label: 'DevOps Tools', description: 'Automate deployment and operations' },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Technology Stack</h3>
          <p className="text-sm text-muted-foreground">Select the technologies you'll use - hover for details</p>
        </div>
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="space-y-6">
          {categories.map(({ key, label, description }) => (
            <div key={key}>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-foreground">{label}</h4>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TECHNOLOGIES[key].map((tech) => {
                  const isSelected = data.technologies?.includes(tech);
                  const techInfo = TECHNOLOGY_DESCRIPTIONS[tech];
                  
                  return (
                    <Tooltip key={tech}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => toggleTechnology(tech)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:border-primary/50"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {tech}
                          {techInfo && <Info className="w-3 h-3 opacity-50" />}
                        </button>
                      </TooltipTrigger>
                      {techInfo && (
                        <TooltipContent side="top" className="max-w-xs p-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{tech}</p>
                            <p className="text-xs text-muted-foreground">{techInfo.description}</p>
                            <div className="pt-1 border-t border-border mt-1">
                              <p className="text-xs text-primary">✓ {techInfo.benefits}</p>
                            </div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>

      {data.technologies && data.technologies.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm font-medium mb-2">Selected Stack Overview:</p>
          <div className="flex flex-wrap gap-2">
            {data.technologies.map(tech => {
              const techInfo = TECHNOLOGY_DESCRIPTIONS[tech];
              return (
                <div key={tech} className="text-xs bg-background rounded px-2 py-1 border">
                  <span className="font-medium">{tech}</span>
                  {techInfo && <span className="text-muted-foreground ml-1">- {techInfo.description}</span>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            This stack provides: {data.technologies.map(t => TECHNOLOGY_DESCRIPTIONS[t]?.benefits).filter(Boolean).slice(0, 3).join(' • ')}
          </p>
        </div>
      )}
    </section>
  );
}
