import { Calculator, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <Calculator className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                IT Service Estimator
              </h1>
              <p className="text-xs text-muted-foreground">Enterprise-Grade Project Estimation</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Estimates
          </div>
        </div>
      </div>
    </header>
  );
}
