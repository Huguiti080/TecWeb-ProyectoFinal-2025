export function contienePalabrasOfensivas(texto: string): boolean {
  const palabrasOfensivas = ['tonto', 'idiota', 'feo'];
  return palabrasOfensivas.some(palabra => texto?.toLowerCase().includes(palabra));
}