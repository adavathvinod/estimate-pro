import { EstimatorForm } from '@/components/estimator/EstimatorForm';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-8 sm:py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            IT Project Estimator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get accurate time and cost estimates. Powered by industry-standard metrics.
          </p>
        </div>
      </section>

      {/* Estimator Section */}
      <main className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <EstimatorForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Estimates based on industry-standard rates and historical data.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;