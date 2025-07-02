/**
 * Converts an array of objects to a CSV string.
 * @param headers - An array of strings for the header row.
 * @param data - An array of objects, where each object represents a row.
 * @returns A CSV formatted string.
 */
const convertToCSV = (headers: string[], data: any[]): string => {
  const headerRow = headers.join(',');
  const rows = data.map(row =>
    headers.map(header => {
      let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
      cell = cell.replace(/"/g, '""'); // Escape double quotes
      if (cell.search(/("|,|\n)/g) >= 0) {
        cell = `"${cell}"`; // Enclose in double quotes if it contains commas, newlines, or quotes
      }
      return cell;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
};

/**
 * Triggers a file download in the browser for a given CSV string.
 * @param csvString - The CSV content to download.
 * @param filename - The name of the file to be downloaded.
 */
export const exportToCSV = (headers: string[], data: any[], filename: string): void => {
  const csvString = convertToCSV(headers, data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
