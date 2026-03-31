import { filterFields } from '../../data/filterRegistry';

const operatorMap = {
  'більше': '>',
  'менше': '<',
  'дорівнює': '=',
  'не': '!=',
  'від': '>=',
  'до': '<=',
  'містить': 'LIKE',
  'так': 'Yes',
  'ні': 'No',
  'чоловіча': 'M',
  'жіноча': 'F',
};

export function parseAIQuery(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const field of filterFields) {
    const labelLower = field.label.toLowerCase();
    if (lowerQuery.includes(labelLower)) {
      let matchedValue = '';

      if (field.type === 'select' && field.options) {
        for (const [key, optLabel] of Object.entries(field.options)) {
          if (lowerQuery.includes(optLabel.toLowerCase()) || lowerQuery.includes(key.toLowerCase())) {
            matchedValue = key;
            break;
          }
        }
      }

      for (const [ukWord, engVal] of Object.entries(operatorMap)) {
        if (lowerQuery.includes(ukWord) && !matchedValue) {
          matchedValue = engVal;
        }
      }

      results.push({
        fieldId: field.id,
        label: field.label,
        value: matchedValue,
        zone: lowerQuery.includes('виключ') || lowerQuery.includes('окрім') ? 'exclude' : 'include',
        op: 'ТА',
      });
    }
  }

  return results;
}

export function generateMockSQL(filters) {
  if (filters.length === 0) return '';

  const conditions = filters.map((f) => {
    const val = f.value || '?';
    return `${f.fieldId} = '${val}'`;
  });

  const include = filters.filter((f) => f.zone === 'include');
  const exclude = filters.filter((f) => f.zone === 'exclude');

  let sql = 'SELECT *\nFROM clients\nWHERE ';
  if (include.length > 0) {
    sql += include.map((f) => `${f.fieldId} = '${f.value || '?'}'`).join('\n  AND ');
  }
  if (exclude.length > 0) {
    sql += '\n  AND NOT (' + exclude.map((f) => `${f.fieldId} = '${f.value || '?'}'`).join(' OR ') + ')';
  }

  return sql;
}
