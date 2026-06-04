/**
 * Transforma cualquier string de fecha ISO del backend al formato corporativo:
 * DD/MM/YYYY HH:MI:SS AM / PM (Formato 12 horas en español)
 */
export const formatGlobalDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Validar si es una fecha inválida
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true // Activa automáticamente el sufijo AM / PM
  }).format(date);
};