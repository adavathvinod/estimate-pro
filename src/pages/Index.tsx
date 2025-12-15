import { Header } from '@/components/Header';
import { EstimatorWizard } from '@/components/estimator/EstimatorWizard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-8 sm:py-12 border-b border-border bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Estimate Your Next
            <span className="gradient-hero bg-clip-text text-transparent"> IT Project</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get accurate time and cost estimates for websites, web apps, mobile apps, and IT services. 
            Powered by industry-standard metrics and AI-driven insights.
          </p>
        </div>
      </section>

      {/* Estimator Section */}
      <main className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <EstimatorWizard />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Estimates are based on industry-standard rates and historical project data.</p>
          <p className="mt-1">Actual project timelines may vary based on specific requirements.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
