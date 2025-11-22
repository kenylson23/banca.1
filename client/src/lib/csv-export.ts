/**
 * Biblioteca de Exportação CSV com melhorias
 * 
 * Melhorias implementadas:
 * 1. BOM UTF-8 (Byte Order Mark) para melhor compatibilidade com Excel
 * 2. Escapamento adequado de vírgulas, aspas duplas e quebras de linha
 * 3. Suporte a valores nulos e undefined
 * 4. Encoding correto para caracteres especiais
 * 5. Formatação consistente de datas
 */

/**
 * Escapa um valor para uso em CSV
 * - Valores com vírgulas, aspas ou quebras de linha são encapsulados em aspas
 * - Aspas duplas dentro do valor são duplicadas (padrão RFC 4180)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // Se contém vírgula, quebra de linha ou aspas duplas, deve ser encapsulado em aspas
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Duplicar aspas duplas internas (RFC 4180)
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}

/**
 * Converte um array de objetos para CSV
 */
function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Extrair headers (chaves do primeiro objeto)
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(',');

  // Processar cada linha de dados
  const rows = data.map(row => 
    headers.map(header => escapeCSVValue(row[header])).join(',')
  );

  return [headerRow, ...rows].join('\n');
}

export interface ExportCSVOptions {
  /** Nome do arquivo (sem extensão) */
  filename: string;
  
  /** Dados a serem exportados */
  data: Record<string, any>[];
  
  /** 
   * Incluir BOM UTF-8 para melhor compatibilidade com Excel 
   * @default true
   */
  includeBOM?: boolean;
  
  /**
   * Sufixo adicional para o nome do arquivo (ex: data, período)
   * @default undefined
   */
  filenameSuffix?: string;
}

/**
 * Exporta dados para CSV com melhorias de encoding e formatação
 * 
 * Exemplo de uso:
 * ```ts
 * const orders = [
 *   { Data: '22/11/2025', Mesa: 5, Total: 'Kz 1.500,00' },
 *   { Data: '22/11/2025', Mesa: 3, Total: 'Kz 2.300,50' }
 * ];
 * 
 * exportToCSV({
 *   filename: 'relatorio_pedidos',
 *   data: orders,
 *   filenameSuffix: '22-11-2025_30-11-2025'
 * });
 * ```
 */
export function exportToCSV(options: ExportCSVOptions): void {
  const {
    filename,
    data,
    includeBOM = true,
    filenameSuffix
  } = options;

  if (!data || data.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  try {
    // Converter dados para CSV
    const csvContent = convertToCSV(data);

    // Adicionar BOM UTF-8 para melhor compatibilidade com Excel
    // O BOM garante que o Excel reconheça o arquivo como UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = includeBOM ? BOM + csvContent : csvContent;

    // Criar blob com encoding UTF-8
    const blob = new Blob([csvWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    });

    // Criar link de download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // Montar nome do arquivo
    const fullFilename = filenameSuffix 
      ? `${filename}_${filenameSuffix}.csv`
      : `${filename}.csv`;
    
    link.download = fullFilename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar URL do blob
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw new Error('Falha ao exportar arquivo CSV');
  }
}

/**
 * Helper para formatar datas no padrão brasileiro para CSV
 */
export function formatDateForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Helper para formatar valores monetários para CSV (já formatados)
 */
export function formatCurrencyForCSV(value: number | string, currency: string = 'Kz'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${currency} ${numValue.toFixed(2).replace('.', ',')}`;
}
