import { ConstructionTask, MaterialLedgerItem, Project, Language } from '../types';
import { getPhaseName, getPriorityName, getTaskStatusName } from './translations';

/**
 * Escapes a cell value for standard CSV (RFC 4180 compliant)
 */
const escapeCSV = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '""';
  const stringValue = String(value);
  // If value contains comma, quotes, or newline, wrap in quotes and double internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

/**
 * Download a CSV string with UTF-8 BOM for full compatibility with MS Excel & Google Sheets
 */
const downloadCSV = (csvContent: string, fileName: string) => {
  // UTF-8 BOM \uFEFF ensures Excel displays non-ASCII characters (Urdu/special chars) correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports tasks to CSV
 */
export const exportTasksToCSV = (
  tasks: ConstructionTask[],
  projects: Project[],
  language: Language = 'en'
) => {
  const headers = [
    'Task ID',
    'Project Code',
    'Project Name',
    'Task Title',
    'Task Title (Urdu)',
    'Construction Phase',
    'Status',
    'Priority',
    'Trade',
    'Contractor / Subcontractor',
    'Crew Size (Labour)',
    'Progress (%)',
    'Start Date',
    'Due Date',
    'Actual End Date',
    'Estimated Cost (PKR)',
    'Actual Cost (PKR)',
    'Checklist Total',
    'Checklist Completed',
    'Site Notes & Specs'
  ];

  const rows = tasks.map(task => {
    const proj = projects.find(p => p.id === task.projectId);
    const checksTotal = task.checklist.length;
    const checksCompleted = task.checklist.filter(c => c.completed).length;

    return [
      escapeCSV(task.id),
      escapeCSV(proj?.code || ''),
      escapeCSV(proj?.name || ''),
      escapeCSV(task.title),
      escapeCSV(task.titleUrdu || ''),
      escapeCSV(getPhaseName(task.phase, language)),
      escapeCSV(getTaskStatusName(task.status, language)),
      escapeCSV(getPriorityName(task.priority, language)),
      escapeCSV(task.trade),
      escapeCSV(task.contractor),
      escapeCSV(task.crewSize),
      escapeCSV(task.progressPercentage),
      escapeCSV(task.startDate),
      escapeCSV(task.dueDate),
      escapeCSV(task.actualEndDate || ''),
      escapeCSV(task.estimatedCost),
      escapeCSV(task.actualCost || ''),
      escapeCSV(checksTotal),
      escapeCSV(checksCompleted),
      escapeCSV(task.notes || '')
    ].join(',');
  });

  const csvString = [headers.map(h => escapeCSV(h)).join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvString, `al-asad-constructors-tasks-${dateStr}.csv`);
};

/**
 * Exports material ledger to CSV
 */
export const exportMaterialsToCSV = (
  materials: MaterialLedgerItem[],
  projects: Project[],
  language: Language = 'en'
) => {
  const headers = [
    'Material ID',
    'Project Code',
    'Project Name',
    'Material Description',
    'Category',
    'Quantity',
    'Unit',
    'Unit Rate (PKR)',
    'Total Amount (PKR)',
    'Supplier / Vendor',
    'Invoice / Bilty #',
    'Date Recorded',
    'Procurement Status'
  ];

  const rows = materials.map(mat => {
    const proj = projects.find(p => p.id === mat.projectId);

    return [
      escapeCSV(mat.id),
      escapeCSV(proj?.code || ''),
      escapeCSV(proj?.name || ''),
      escapeCSV(mat.materialName),
      escapeCSV(mat.category.toUpperCase()),
      escapeCSV(mat.quantity),
      escapeCSV(mat.unit),
      escapeCSV(mat.ratePerUnit),
      escapeCSV(mat.totalAmount),
      escapeCSV(mat.supplier),
      escapeCSV(mat.invoiceNo || ''),
      escapeCSV(mat.date),
      escapeCSV(mat.status.toUpperCase())
    ].join(',');
  });

  const csvString = [headers.map(h => escapeCSV(h)).join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvString, `al-asad-materials-ledger-${dateStr}.csv`);
};
