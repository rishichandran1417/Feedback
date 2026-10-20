import * as XLSX from 'xlsx';
import { Submission } from '../types/database';

/**
 * Sanitize cell content against Formula Injection (CSV / Excel Injection)
 * Prevents execution of formulas starting with =, +, -, @, \t, or \r
 */
export function sanitizeForSpreadsheet(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some((char) => str.startsWith(char))) {
    return `'${str}`; // Prepend single quote to neutralize formula execution
  }
  return str;
}

export function formatDurationHours(createdIso: string, resolvedIso?: string): string {
  if (!resolvedIso) return 'N/A';
  const start = new Date(createdIso).getTime();
  const end = new Date(resolvedIso).getTime();
  const hours = Math.round((end - start) / (1000 * 3600));
  return `${hours} hrs (${(hours / 24).toFixed(1)} days)`;
}

export function exportSubmissionsToExcel(submissions: Submission[], filename = 'college_grievance_report.xlsx') {
  const rows = submissions.map((s) => ({
    'Reference Number': sanitizeForSpreadsheet(s.reference_number),
    'Submission Date': new Date(s.created_at).toLocaleString(),
    'Submission Type': sanitizeForSpreadsheet(s.submission_type.replace(/_/g, ' ').toUpperCase()),
    'Category': sanitizeForSpreadsheet(s.category_name || 'N/A'),
    'Department': sanitizeForSpreadsheet(s.department_name || 'N/A'),
    'Subject': sanitizeForSpreadsheet(s.subject),
    'Priority': sanitizeForSpreadsheet(s.priority.toUpperCase()),
    'Status': sanitizeForSpreadsheet(s.status.replace(/_/g, ' ').toUpperCase()),
    'Student Identifier': s.is_anonymous ? 'Anonymous' : sanitizeForSpreadsheet(s.student_email || s.student_id),
    'Assigned Administrator': sanitizeForSpreadsheet(s.assigned_to_name || 'Unassigned'),
    'Due Date': s.due_date ? new Date(s.due_date).toLocaleDateString() : 'N/A',
    'Resolution Date': s.resolution_date ? new Date(s.resolution_date).toLocaleDateString() : 'N/A',
    'Resolution Time': formatDurationHours(s.created_at, s.resolution_date),
    'Resolution Summary': sanitizeForSpreadsheet(s.resolution_summary || 'N/A'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Grievance Report');

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

export function exportSubmissionsToCsv(submissions: Submission[], filename = 'college_grievance_report.csv') {
  const headers = [
    'Reference Number',
    'Submission Date',
    'Submission Type',
    'Category',
    'Department',
    'Subject',
    'Priority',
    'Status',
    'Student Identifier',
    'Assigned Administrator',
    'Due Date',
    'Resolution Date',
    'Resolution Time',
    'Resolution Summary',
  ];

  const escapeCsvCell = (str: string) => {
    const sanitized = sanitizeForSpreadsheet(str);
    if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
      return `"${sanitized.replace(/"/g, '""')}"`;
    }
    return sanitized;
  };

  const csvRows = [headers.join(',')];

  submissions.forEach((s) => {
    const row = [
      escapeCsvCell(s.reference_number),
      escapeCsvCell(new Date(s.created_at).toLocaleString()),
      escapeCsvCell(s.submission_type.replace(/_/g, ' ').toUpperCase()),
      escapeCsvCell(s.category_name || 'N/A'),
      escapeCsvCell(s.department_name || 'N/A'),
      escapeCsvCell(s.subject),
      escapeCsvCell(s.priority.toUpperCase()),
      escapeCsvCell(s.status.replace(/_/g, ' ').toUpperCase()),
      escapeCsvCell(s.is_anonymous ? 'Anonymous' : s.student_email || s.student_id),
      escapeCsvCell(s.assigned_to_name || 'Unassigned'),
      escapeCsvCell(s.due_date ? new Date(s.due_date).toLocaleDateString() : 'N/A'),
      escapeCsvCell(s.resolution_date ? new Date(s.resolution_date).toLocaleDateString() : 'N/A'),
      escapeCsvCell(formatDurationHours(s.created_at, s.resolution_date)),
      escapeCsvCell(s.resolution_summary || 'N/A'),
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
