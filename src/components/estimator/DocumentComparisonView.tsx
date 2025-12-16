import { DocumentAnalysis } from '@/types/estimator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatDuration } from '@/lib/estimationEngine';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ComparisonItem {
  id: string;
  fileName: string;
  analysis: DocumentAnalysis;
}

interface DocumentComparisonViewProps {
  items: ComparisonItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function DocumentComparisonView({ items, onRemove, onClose }: DocumentComparisonViewProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (current: number, baseline: number) => {
    const diff = ((current - baseline) / baseline) * 100;
    if (Math.abs(diff) < 5) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-emerald-500" />;
  };

  const exportComparisonPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('Document Analysis Comparison', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    let yPos = 40;

    const summaryData = items.map(item => [
      item.fileName.substring(0, 25),
      `${item.analysis.confidenceScore}%`,
      item.analysis.estimatedHours.toString(),
      formatDuration(item.analysis.estimatedWeeks),
      formatCurrency(item.analysis.estimatedCost),
      item.analysis.suggestedComplexity
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Document', 'Confidence', 'Hours', 'Duration', 'Cost', 'Complexity']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Hours Breakdown Comparison', 14, yPos);
    yPos += 10;

    const stages = ['PM', 'Design', 'Frontend', 'Backend', 'QA', 'DevOps'];
    const breakdownData = stages.map(stage => {
      const key = stage.toLowerCase().replace(' ', '') as keyof NonNullable<DocumentAnalysis['breakdown']>;
      return [
        stage,
        ...items.map(item => item.analysis.breakdown?.[key]?.toString() || '-')
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Stage', ...items.map(i => i.fileName.substring(0, 15))]],
      body: breakdownData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.save('analysis-comparison.pdf');
  };

  const baseline = items[0]?.analysis;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Compare {items.length} Analyses
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportComparisonPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold">Metric</th>
                {items.map(item => (
                  <th key={item.id} className="text-left py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate max-w-32">{item.fileName}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onRemove(item.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Confidence Score</td>
                {items.map((item, idx) => (
                  <td key={item.id} className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(item.analysis.confidenceScore)}>
                        {item.analysis.confidenceScore}%
                      </Badge>
                      {idx > 0 && baseline && getTrendIcon(
                        item.analysis.confidenceScore,
                        baseline.confidenceScore
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Total Hours</td>
                {items.map((item, idx) => (
                  <td key={item.id} className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.analysis.estimatedHours}h</span>
                      {idx > 0 && baseline && getTrendIcon(
                        item.analysis.estimatedHours,
                        baseline.estimatedHours
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Duration</td>
                {items.map(item => (
                  <td key={item.id} className="py-3 px-2">
                    {formatDuration(item.analysis.estimatedWeeks)}
                  </td>
                ))}
              </tr>

              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Estimated Cost</td>
                {items.map((item, idx) => (
                  <td key={item.id} className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {formatCurrency(item.analysis.estimatedCost)}
                      </span>
                      {idx > 0 && baseline && getTrendIcon(
                        item.analysis.estimatedCost,
                        baseline.estimatedCost
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Complexity</td>
                {items.map(item => (
                  <td key={item.id} className="py-3 px-2 capitalize">
                    <Badge variant="outline">{item.analysis.suggestedComplexity}</Badge>
                  </td>
                ))}
              </tr>

              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Screens/Pages</td>
                {items.map(item => (
                  <td key={item.id} className="py-3 px-2">
                    {item.analysis.suggestedScreens}
                  </td>
                ))}
              </tr>

              <tr className="bg-muted/50">
                <td colSpan={items.length + 1} className="py-2 px-2 font-semibold">
                  Hours Breakdown
                </td>
              </tr>

              {['pm', 'design', 'frontend', 'backend', 'qa', 'devops'].map(stage => (
                <tr key={stage} className="border-b">
                  <td className="py-2 px-2 pl-4 capitalize">{stage}</td>
                  {items.map(item => (
                    <td key={item.id} className="py-2 px-2">
                      {item.analysis.breakdown?.[stage as keyof NonNullable<DocumentAnalysis['breakdown']>] || '-'}h
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Confidence Analysis</h4>
          {items.map(item => (
            <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-sm">{item.fileName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {item.analysis.confidenceReason || 'No confidence reason provided.'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
