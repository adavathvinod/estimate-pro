import { useState } from 'react';
import { Check, ChevronRight, Sparkles, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { INDUSTRY_TEMPLATES, TEMPLATE_CATEGORIES, IndustryTemplate, getTemplatesByCategory } from '@/lib/industryTemplates';
import { ProjectFormData } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface IndustryTemplateSelectorProps {
  onApplyTemplate: (updates: Partial<ProjectFormData>, template: IndustryTemplate) => void;
}

export function IndustryTemplateSelector({ onApplyTemplate }: IndustryTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);

  const handleApply = () => {
    if (selectedTemplate) {
      onApplyTemplate(
        {
          ...selectedTemplate.defaults,
          technologies: selectedTemplate.techStack,
        },
        selectedTemplate
      );
      setOpen(false);
      setSelectedCategory(null);
      setSelectedTemplate(null);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'complex': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Use Industry Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Industry Templates
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-3">Categories</h4>
            {TEMPLATE_CATEGORIES.map(category => {
              const templates = getTemplatesByCategory(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedTemplate(null);
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all flex items-center justify-between",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.label}</p>
                      <p className={cn(
                        "text-xs",
                        selectedCategory === category.id 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      )}>
                        {templates.length} templates
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Templates List */}
          <ScrollArea className="h-full border rounded-lg">
            <div className="p-3 space-y-2">
              {selectedCategory ? (
                getTemplatesByCategory(selectedCategory).map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all border",
                      selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ~{template.estimatedScreens} screens
                          </Badge>
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Select a category to see templates</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Template Details */}
          <div className="border rounded-lg p-4 overflow-auto">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                  <div>
                    <h4 className="font-semibold">{selectedTemplate.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Screens</p>
                    <p className="font-semibold">{selectedTemplate.estimatedScreens}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Complexity</p>
                    <p className="font-semibold capitalize">{selectedTemplate.complexity}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time Factor</p>
                      <p className="font-semibold">{selectedTemplate.timeMultiplier}x</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Security</p>
                      <p className="font-semibold capitalize">{selectedTemplate.securityLevel}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Key Features</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Recommended Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.techStack.map((tech, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleApply} className="w-full">
                  <Check className="w-4 h-4 mr-2" />
                  Apply Template
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Sparkles className="w-8 h-8 mb-2" />
                <p className="text-sm">Select a template to see details</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
