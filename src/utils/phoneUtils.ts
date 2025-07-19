
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se já tem código do país, retorna como está
  if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
    return `+${cleanPhone}`;
  }
  
  // Se tem 11 dígitos (celular) ou 10 dígitos (fixo), adiciona o +55
  if (cleanPhone.length === 11 || cleanPhone.length === 10) {
    return `+55${cleanPhone}`;
  }
  
  // Se tem mais de 11 dígitos e não começa com 55, assume que já tem código do país
  if (cleanPhone.length > 11) {
    return `+${cleanPhone}`;
  }
  
  // Para outros casos, retorna com +55
  return `+55${cleanPhone}`;
};

export const displayPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove o +55 para exibição
  if (phone.startsWith('+55')) {
    return phone.substring(3);
  }
  
  return phone.replace(/^\+/, '');
};
