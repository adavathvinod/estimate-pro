import { ProjectEstimate } from '@/types/estimator';
import { formatCurrency, formatDuration } from './estimationEngine';

export function generateCSVReport(estimate: ProjectEstimate): void {
  const rows: string[][] = [];
  
  // Header info
  rows.push(['IT Service Product Estimate']);
  rows.push(['Generated', estimate.createdAt.toLocaleDateString()]);
  rows.push([]);
  
  // Project Overview
  rows.push(['Project Overview']);
  rows.push(['Project Name', estimate.projectName]);
  rows.push(['Project Type', estimate.projectType.replace('-', ' ').toUpperCase()]);
  rows.push(['Platform', Array.isArray(estimate.platform) ? estimate.platform.join(', ') : String(estimate.platform)]);
  rows.push(['Complexity', estimate.complexity.toUpperCase()]);
  rows.push(['Team Experience', estimate.teamExperience || 'N/A']);
  rows.push(['Technologies', estimate.technologies?.join(', ') || 'N/A']);
  rows.push([]);
  
  // Summary Stats
  rows.push(['Summary']);
  rows.push(['Total Hours', String(estimate.totalHours)]);
  rows.push(['Total Duration', formatDuration(estimate.totalWeeks)]);
  rows.push(['Total Cost', formatCurrency(estimate.totalCost)]);
  rows.push([]);
  
  // Stage Breakdown
  rows.push(['Stage Breakdown']);
  rows.push(['Stage', 'Hours', 'Weeks', 'Cost', 'Personnel', 'Experience', 'Tools', 'Reason']);
  estimate.stages.forEach(stage => {
    rows.push([
      stage.stage,
      String(stage.hours),
      String(stage.weeks),
      formatCurrency(stage.cost),
      String(stage.personnel),
      stage.experience,
      stage.tools.join('; '),
      stage.reason
    ]);
  });
  rows.push([]);
  
  // Custom Items
  if (estimate.customItems && estimate.customItems.length > 0) {
    rows.push(['Custom Items']);
    rows.push(['Name', 'Stage', 'Complexity', 'Hours', 'Reason']);
    estimate.customItems.forEach(item => {
      rows.push([item.name, item.stage, item.complexity, String(item.hours), item.reason]);
    });
    rows.push([]);
  }
  
  // Resource Allocation
  if (estimate.resourceAllocation) {
    rows.push(['Resource Allocation & Hardware Planning']);
    rows.push(['Desired Duration (Months)', String(estimate.resourceAllocation.desiredDurationMonths)]);
    rows.push(['Working Hours per FTE/Month', String(estimate.resourceAllocation.workingHoursPerMonth)]);
    rows.push([]);
    
    rows.push(['FTE Staffing Plan']);
    rows.push(['Role', 'Count']);
    rows.push(['Frontend Developers', String(estimate.resourceAllocation.staffing.frontend)]);
    rows.push(['Backend Developers', String(estimate.resourceAllocation.staffing.backend)]);
    rows.push(['QA Specialists', String(estimate.resourceAllocation.staffing.qa)]);
    rows.push(['Project Managers', String(estimate.resourceAllocation.staffing.pm)]);
    rows.push(['DevOps Engineers', String(estimate.resourceAllocation.staffing.devops)]);
    rows.push(['Total Team Size', String(estimate.resourceAllocation.staffing.total) + ' FTE']);
    rows.push([]);
    
    rows.push(['Hardware & Environment Checklist']);
    rows.push(['Infrastructure', 'Required']);
    const hw = estimate.resourceAllocation.hardware;
    rows.push(['Linux Server', hw.linuxServer ? 'Yes' : 'No']);
    rows.push(['Mac OS Build Machine', hw.macOsBuildMachine ? 'Yes' : 'No']);
    rows.push(['Staging Environment', hw.stagingEnvironment ? 'Yes' : 'No']);
    rows.push(['Production Server', hw.productionServer ? 'Yes' : 'No']);
    rows.push(['CI/CD Pipeline', hw.cicdPipeline ? 'Yes' : 'No']);
    
    // Hardware costs if available
    if (estimate.resourceAllocation.hardwareCosts) {
      rows.push([]);
      rows.push(['Hardware Cost Estimates (Monthly)']);
      const costs = estimate.resourceAllocation.hardwareCosts;
      if (costs.linuxServer) rows.push(['Linux Server', formatCurrency(costs.linuxServer)]);
      if (costs.macOsBuildMachine) rows.push(['Mac OS Build Machine', formatCurrency(costs.macOsBuildMachine)]);
      if (costs.stagingEnvironment) rows.push(['Staging Environment', formatCurrency(costs.stagingEnvironment)]);
      if (costs.productionServer) rows.push(['Production Server', formatCurrency(costs.productionServer)]);
      if (costs.cicdPipeline) rows.push(['CI/CD Pipeline', formatCurrency(costs.cicdPipeline)]);
      rows.push(['Total Monthly Infrastructure', formatCurrency(costs.totalMonthly)]);
      rows.push(['Total Project Infrastructure', formatCurrency(costs.totalProject)]);
    }
  }
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
        ? `"${escaped}"` 
        : escaped;
    }).join(',')
  ).join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${estimate.projectName.replace(/\s+/g, '-')}-estimate.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function generateExcelReport(estimate: ProjectEstimate): void {
  // For Excel, we'll create a more structured CSV that opens well in Excel
  // with UTF-8 BOM for proper character encoding
  const BOM = '\uFEFF';
  
  const rows: string[][] = [];
  
  // Title row with merge indication
  rows.push(['IT Service Product Estimate', '', '', '', '', '', '', '']);
  rows.push(['Generated:', estimate.createdAt.toLocaleDateString()]);
  rows.push([]);
  
  // Project Overview section
  rows.push(['PROJECT OVERVIEW']);
  rows.push(['Field', 'Value']);
  rows.push(['Project Name', estimate.projectName]);
  rows.push(['Project Type', estimate.projectType.replace('-', ' ').toUpperCase()]);
  rows.push(['Platform', Array.isArray(estimate.platform) ? estimate.platform.join(', ') : String(estimate.platform)]);
  rows.push(['Complexity', estimate.complexity.toUpperCase()]);
  rows.push(['Team Experience', estimate.teamExperience || 'N/A']);
  rows.push(['Technologies', estimate.technologies?.join(', ') || 'N/A']);
  rows.push([]);
  
  // Summary section
  rows.push(['ESTIMATE SUMMARY']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total Hours', String(estimate.totalHours)]);
  rows.push(['Total Duration', formatDuration(estimate.totalWeeks)]);
  rows.push(['Total Cost', formatCurrency(estimate.totalCost)]);
  rows.push([]);
  
  // Stage Breakdown
  rows.push(['STAGE BREAKDOWN']);
  rows.push(['Stage', 'Hours', 'Weeks', 'Cost', 'Personnel', 'Experience', 'Tools']);
  estimate.stages.forEach(stage => {
    rows.push([
      stage.stage,
      String(stage.hours),
      String(stage.weeks),
      formatCurrency(stage.cost),
      String(stage.personnel),
      stage.experience,
      stage.tools.join('; ')
    ]);
  });
  rows.push([]);
  
  // Resource Allocation
  if (estimate.resourceAllocation) {
    rows.push(['RESOURCE ALLOCATION']);
    rows.push(['Duration (Months)', String(estimate.resourceAllocation.desiredDurationMonths)]);
    rows.push([]);
    
    rows.push(['FTE STAFFING']);
    rows.push(['Role', 'Count']);
    rows.push(['Frontend', String(estimate.resourceAllocation.staffing.frontend)]);
    rows.push(['Backend', String(estimate.resourceAllocation.staffing.backend)]);
    rows.push(['QA', String(estimate.resourceAllocation.staffing.qa)]);
    rows.push(['PM', String(estimate.resourceAllocation.staffing.pm)]);
    rows.push(['DevOps', String(estimate.resourceAllocation.staffing.devops)]);
    rows.push(['TOTAL', String(estimate.resourceAllocation.staffing.total)]);
    rows.push([]);
    
    rows.push(['HARDWARE REQUIREMENTS']);
    rows.push(['Infrastructure', 'Required', 'Monthly Cost']);
    const hw = estimate.resourceAllocation.hardware;
    const costs = estimate.resourceAllocation.hardwareCosts;
    rows.push(['Linux Server', hw.linuxServer ? 'Yes' : 'No', costs?.linuxServer ? formatCurrency(costs.linuxServer) : '-']);
    rows.push(['Mac OS Build Machine', hw.macOsBuildMachine ? 'Yes' : 'No', costs?.macOsBuildMachine ? formatCurrency(costs.macOsBuildMachine) : '-']);
    rows.push(['Staging Environment', hw.stagingEnvironment ? 'Yes' : 'No', costs?.stagingEnvironment ? formatCurrency(costs.stagingEnvironment) : '-']);
    rows.push(['Production Server', hw.productionServer ? 'Yes' : 'No', costs?.productionServer ? formatCurrency(costs.productionServer) : '-']);
    rows.push(['CI/CD Pipeline', hw.cicdPipeline ? 'Yes' : 'No', costs?.cicdPipeline ? formatCurrency(costs.cicdPipeline) : '-']);
    if (costs) {
      rows.push(['TOTAL (Monthly)', '', formatCurrency(costs.totalMonthly)]);
      rows.push(['TOTAL (Project)', '', formatCurrency(costs.totalProject)]);
    }
  }
  
  // Convert to CSV
  const csvContent = BOM + rows.map(row => 
    row.map(cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  ).join('\r\n');
  
  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${estimate.projectName.replace(/\s+/g, '-')}-estimate.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}
