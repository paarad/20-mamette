export type SupportedLang = 'fr' | 'en';

export function detectLanguage(input: string): SupportedLang {
  const text = (input || '').toLowerCase();
  // Quick French cues: accented letters and common stopwords
  const frenchSignals = [
    ' le ', ' la ', ' les ', ' un ', ' une ', ' des ', ' et ', ' ou ', ' mais ', ' donc ', ' or ', ' ni ', ' car ',
    ' je ', ' tu ', ' il ', ' elle ', ' nous ', ' vous ', ' ils ', ' elles ',
    ' que ', ' qui ', ' dont ', ' où ', ' pour ', ' avec ', ' sans ', ' sur ', ' sous ', ' parmi ', ' chez ',
    ' l\'amour', ' beauté', ' rêve', ' couleur', ' lumière', ' nuit', ' âme', ' coeur', ' coeur ',
  ];
  const accented = /[àâäéèêëîïôöùûüçœ]/.test(text);
  const hasFrenchWord = frenchSignals.some((w) => text.includes(w));
  return accented || hasFrenchWord ? 'fr' : 'en';
}

export function languageStyle(lang: SupportedLang): string {
  if (lang === 'fr') {
    // Emphasize French cultural cues and explicitly forbid ANY lettering
    return 'French literary cover aesthetics, European design sensibility, subtle symbolism; strictly no text or lettering in any language.';
  }
  // Default English style
  return 'Contemporary English-language cover aesthetics; strictly no text or lettering in any language.';
} 