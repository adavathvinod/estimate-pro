import { ProjectEstimate } from '@/types/estimator';
import { formatCurrency, formatDuration } from './estimationEngine';

export async function generatePDFReport(estimate: ProjectEstimate): Promise<void> {
  // Dynamic import to avoid bundling issues
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [13, 148, 136]; // teal-500
  const accentColor: [number, number, number] = [245, 158, 11]; // amber-500
  const textColor: [number, number, number] = [31, 41, 55]; // gray-800
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('IT Service Product Estimate', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${estimate.createdAt.toLocaleDateString()}`, 14, 32);
  
  // Project Info Section
  let yPos = 55;
  
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Overview', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const projectInfo = [
    ['Project Name', estimate.projectName],
    ['Project Type', estimate.projectType.replace('-', ' ').toUpperCase()],
    ['Platform', (Array.isArray(estimate.platform) ? estimate.platform.join(', ') : String(estimate.platform)).replace(/-/g, ' ').toUpperCase()],
    ['Complexity', estimate.complexity.toUpperCase()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: projectInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 60 }
    },
    margin: { left: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary Stats
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`Total Time: ${formatDuration(estimate.totalWeeks)}`, 24, yPos + 15);
  doc.text(`(~${estimate.totalHours} hours)`, 24, yPos + 25);
  
  doc.setTextColor(...accentColor);
  doc.text(`Total Cost: ${formatCurrency(estimate.totalCost)}`, pageWidth - 80, yPos + 15);
  doc.text('Based on industry rates', pageWidth - 80, yPos + 25);
  
  yPos += 50;
  
  // Stage Breakdown Table
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resource Allocation by Stage', 14, yPos);
  yPos += 8;
  
  const stageData = estimate.stages.map(stage => [
    stage.stage,
    formatDuration(stage.weeks),
    `${stage.hours}h`,
    formatCurrency(stage.cost),
    `${stage.personnel} (${stage.experience})`,
    stage.tools.slice(0, 3).join(', ')
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Stage', 'Duration', 'Hours', 'Cost', 'Personnel', 'Tools']],
    body: stageData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 25 },
      2: { cellWidth: 18 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35 },
      5: { cellWidth: 40 }
    },
    margin: { left: 14, right: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Time Allocation Chart (simple bar representation)
  if (yPos < 220) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Time Distribution', 14, yPos);
    yPos += 10;
    
    const barHeight = 12;
    const maxBarWidth = pageWidth - 80;
    
    estimate.stages.forEach((stage, index) => {
      const barWidth = (stage.hours / estimate.totalHours) * maxBarWidth;
      const percentage = Math.round((stage.hours / estimate.totalHours) * 100);
      
      // Stage colors
      const stageColors: [number, number, number][] = [
        [147, 51, 234],  // purple
        [236, 72, 153],  // pink
        [59, 130, 246],  // blue
        [16, 185, 129],  // emerald
        [245, 158, 11],  // amber
        [239, 68, 68],   // red
      ];
      
      doc.setFillColor(...stageColors[index % stageColors.length]);
      doc.roundedRect(14, yPos, barWidth, barHeight, 2, 2, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(`${stage.stage} (${percentage}%)`, barWidth + 20, yPos + 8);
      
      yPos += barHeight + 4;
    });
  }
  
  // Stage Details with Reasons (new page if needed)
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Detailed Time Allocation Rationale', 14, yPos);
  yPos += 15;
  
  estimate.stages.forEach((stage) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yPos, pageWidth - 28, 30 + (stage.customItems?.length || 0) * 8, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text(stage.stage, 20, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formatDuration(stage.weeks)} | ${formatCurrency(stage.cost)}`, pageWidth - 60, yPos + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    const reasonLines = doc.splitTextToSize(stage.reason || 'Time allocated based on project requirements.', pageWidth - 45);
    doc.text(reasonLines, 20, yPos + 20);
    
    // Custom items
    if (stage.customItems && stage.customItems.length > 0) {
      let itemY = yPos + 25 + reasonLines.length * 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      stage.customItems.forEach(item => {
        doc.text(`• ${item.name} (${item.complexity}): ${item.hours}h - ${item.reason}`, 25, itemY);
        itemY += 6;
      });
    }
    
    yPos += 38 + (stage.customItems?.length || 0) * 8;
  });

  // Resource Allocation & Hardware Planning Section
  if (estimate.resourceAllocation) {
    if (yPos > 180) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Resource Allocation & Hardware Planning', 14, yPos);
    yPos += 15;

    // Staffing Plan
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('FTE Staffing Plan', 14, yPos);
    yPos += 8;

    const staffingData = [
      ['Frontend Developers', String(estimate.resourceAllocation.staffing.frontend)],
      ['Backend Developers', String(estimate.resourceAllocation.staffing.backend)],
      ['QA Specialists', String(estimate.resourceAllocation.staffing.qa)],
      ['Project Managers', String(estimate.resourceAllocation.staffing.pm)],
      ['DevOps Engineers', String(estimate.resourceAllocation.staffing.devops)],
      ['Total Team Size', String(estimate.resourceAllocation.staffing.total) + ' FTE'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Role', 'Count']],
      body: staffingData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 }
      },
      margin: { left: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Project Duration
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Desired Project Duration: ${estimate.resourceAllocation.desiredDurationMonths} months`, 14, yPos);
    yPos += 8;
    doc.text(`Working Hours per FTE/Month: ${estimate.resourceAllocation.workingHoursPerMonth}h`, 14, yPos);
    yPos += 15;

    // Hardware Checklist
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Hardware & Environment Checklist', 14, yPos);
    yPos += 10;

    const hw = estimate.resourceAllocation.hardware;
    const hardwareItems = [
      ['Linux Server', hw.linuxServer ? '✓ Required' : '✗ Not Required'],
      ['Mac OS Build Machine', hw.macOsBuildMachine ? '✓ Required' : '✗ Not Required'],
      ['Staging Environment', hw.stagingEnvironment ? '✓ Required' : '✗ Not Required'],
      ['Production Server', hw.productionServer ? '✓ Required' : '✗ Not Required'],
      ['CI/CD Pipeline', hw.cicdPipeline ? '✓ Required' : '✗ Not Required'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Infrastructure', 'Status', 'Monthly Cost']],
      body: hardwareItems.map(item => {
        const hw = estimate.resourceAllocation!.hardware;
        const costs = estimate.resourceAllocation?.hardwareCosts;
        const costMap: Record<string, number | undefined> = {
          'Linux Server': costs?.linuxServer,
          'Mac OS Build Machine': costs?.macOsBuildMachine,
          'Staging Environment': costs?.stagingEnvironment,
          'Production Server': costs?.productionServer,
          'CI/CD Pipeline': costs?.cicdPipeline,
        };
        return [...item, costMap[item[0]] ? formatCurrency(costMap[item[0]]!) : '-'];
      }),
      theme: 'striped',
      headStyles: {
        fillColor: accentColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 }
      },
      margin: { left: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Hardware Cost Summary
    if (estimate.resourceAllocation.hardwareCosts) {
      const costs = estimate.resourceAllocation.hardwareCosts;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Infrastructure Cost Summary', 14, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Monthly Infrastructure Cost: ${formatCurrency(costs.totalMonthly)}`, 14, yPos);
      yPos += 6;
      doc.text(`Total Project Infrastructure (${estimate.resourceAllocation.desiredDurationMonths} months): ${formatCurrency(costs.totalProject)}`, 14, yPos);
      yPos += 10;
    }
  }
  
  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Generated by IT Service Product Estimator',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  // Save
  doc.save(`${estimate.projectName.replace(/\s+/g, '-')}-estimate.pdf`);
}
