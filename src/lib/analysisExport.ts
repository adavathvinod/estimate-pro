import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentAnalysis, HOURLY_RATES } from '@/types/estimator';
import { formatCurrency, formatDuration } from './estimationEngine';

export function exportAnalysisToPDF(
  analysis: DocumentAnalysis,
  fileName: string,
  projectName?: string
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('Document Analysis Report', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(fileName, 14, 30);
  
  if (projectName) {
    doc.text(`Project: ${projectName}`, 14, 38);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, projectName ? 46 : 38);
  doc.text(`Analyzed: ${analysis.analyzedAt ? new Date(analysis.analyzedAt).toLocaleString() : 'N/A'}`, 14, projectName ? 52 : 44);

  let yPos = projectName ? 65 : 55;

  // Confidence Score Section
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, yPos, 182, 30, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Confidence Score', 20, yPos + 10);
  
  // Confidence badge color
  const confScore = analysis.confidenceScore;
  if (confScore >= 80) {
    doc.setTextColor(16, 185, 129);
  } else if (confScore >= 60) {
    doc.setTextColor(245, 158, 11);
  } else {
    doc.setTextColor(239, 68, 68);
  }
  
  doc.setFontSize(24);
  doc.text(`${confScore}%`, 170, yPos + 12, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const reasonLines = doc.splitTextToSize(analysis.confidenceReason || 'Analysis complete.', 170);
  doc.text(reasonLines, 20, yPos + 22);
  
  yPos += 40;

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const summaryLines = doc.splitTextToSize(analysis.summary, 180);
  doc.text(summaryLines, 14, yPos);
  yPos += summaryLines.length * 5 + 10;

  // Key Metrics
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Key Estimates', 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Hours', `${analysis.estimatedHours} hours`],
      ['Duration', formatDuration(analysis.estimatedWeeks)],
      ['Estimated Cost', formatCurrency(analysis.estimatedCost)],
      ['Complexity', analysis.suggestedComplexity.charAt(0).toUpperCase() + analysis.suggestedComplexity.slice(1)],
      ['Screens/Pages', analysis.suggestedScreens.toString()],
      ['Features', analysis.suggestedFeatures.length.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Hours Breakdown
  if (analysis.breakdown) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Hours Breakdown by Stage', 14, yPos);
    yPos += 5;

    const breakdownData = [
      ['Project Management', `${analysis.breakdown.pm}h`, `$${(analysis.breakdown.pm * HOURLY_RATES.pm).toLocaleString()}`],
      ['UI/UX Design', `${analysis.breakdown.design}h`, `$${(analysis.breakdown.design * HOURLY_RATES.design).toLocaleString()}`],
      ['Frontend Development', `${analysis.breakdown.frontend}h`, `$${(analysis.breakdown.frontend * HOURLY_RATES.frontend).toLocaleString()}`],
      ['Backend Development', `${analysis.breakdown.backend}h`, `$${(analysis.breakdown.backend * HOURLY_RATES.backend).toLocaleString()}`],
      ['Quality Assurance', `${analysis.breakdown.qa}h`, `$${(analysis.breakdown.qa * HOURLY_RATES.qa).toLocaleString()}`],
      ['DevOps & Deployment', `${analysis.breakdown.devops}h`, `$${(analysis.breakdown.devops * HOURLY_RATES.devops).toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Stage', 'Hours', 'Cost']],
      body: breakdownData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 10 },
      foot: [['Total', `${analysis.estimatedHours}h`, formatCurrency(analysis.estimatedCost)]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Features List
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Identified Features', 14, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  
  analysis.suggestedFeatures.forEach((feature, idx) => {
    if (yPos > 275) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${idx + 1}. ${feature}`, 18, yPos);
    yPos += 5;
  });

  yPos += 10;

  // Technical Requirements
  if (analysis.technicalRequirements?.length) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Technical Requirements', 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    analysis.technicalRequirements.forEach(req => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${req}`, 18, yPos);
      yPos += 5;
    });

    yPos += 10;
  }

  // Risks
  if (analysis.risks?.length) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(200, 0, 0);
    doc.text('Identified Risks', 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    analysis.risks.forEach(risk => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      const riskLines = doc.splitTextToSize(`⚠ ${risk}`, 175);
      doc.text(riskLines, 18, yPos);
      yPos += riskLines.length * 5 + 2;
    });

    yPos += 10;
  }

  // Assumptions
  if (analysis.assumptions?.length) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Assumptions', 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    
    analysis.assumptions.forEach(assumption => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${assumption}`, 18, yPos);
      yPos += 5;
    });
  }

  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | IT Service Product Estimator`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save
  const safeName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '_');
  doc.save(`analysis_${safeName}_${Date.now()}.pdf`);
}
