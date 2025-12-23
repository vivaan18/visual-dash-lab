/**
 * CSV parsing and data profiling utilities
 */

export interface ColumnProfile {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  sampleValues: any[];
  uniqueCount: number;
  nullCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

export interface DataProfile {
  columns: ColumnProfile[];
  rowCount: number;
  headers: string[];
}

/**
 * Parse CSV file to array of objects
 */
export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
};

/**
 * Detect column data type
 */
const detectColumnType = (values: any[]): ColumnProfile['type'] => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'text';

  // Check if numeric
  const numericCount = nonNullValues.filter(v => !isNaN(Number(v))).length;
  if (numericCount / nonNullValues.length > 0.8) return 'numeric';

  // Check if datetime
  const dateCount = nonNullValues.filter(v => {
    const date = new Date(v);
    return !isNaN(date.getTime());
  }).length;
  if (dateCount / nonNullValues.length > 0.8) return 'datetime';

  // Check if categorical (limited unique values)
  const uniqueValues = new Set(nonNullValues);
  if (uniqueValues.size < nonNullValues.length * 0.5 && uniqueValues.size < 20) {
    return 'categorical';
  }

  return 'text';
};

/**
 * Profile data from parsed CSV
 */
export const profileData = (data: any[]): DataProfile => {
  if (data.length === 0) {
    return { columns: [], rowCount: 0, headers: [] };
  }

  const headers = Object.keys(data[0]);
  const columns: ColumnProfile[] = [];

  headers.forEach(header => {
    const values = data.map(row => row[header]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const type = detectColumnType(values);

    const profile: ColumnProfile = {
      name: header,
      type,
      sampleValues: nonNullValues.slice(0, 5),
      uniqueCount: new Set(nonNullValues).size,
      nullCount: values.length - nonNullValues.length,
    };

    if (type === 'numeric') {
      const numericValues = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
      profile.min = Math.min(...numericValues);
      profile.max = Math.max(...numericValues);
      profile.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    }

    columns.push(profile);
  });

  return {
    columns,
    rowCount: data.length,
    headers,
  };
};
