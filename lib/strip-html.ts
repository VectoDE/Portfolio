/**
 * Entfernt HTML-Tags (alles von "<" bis zum naechsten ">") in linearer Zeit.
 * Verhaelt sich wie `input.replace(/<[^>]*>/g, "")`, vermeidet aber das
 * quadratische Backtracking der Regex bei vielen "<" ohne schliessendes ">".
 */
export function stripHtmlTags(input: string): string {
  let result = ""
  let index = 0

  while (index < input.length) {
    const open = input.indexOf("<", index)
    if (open === -1) {
      break
    }

    const close = input.indexOf(">", open + 1)
    if (close === -1) {
      break
    }

    result += input.slice(index, open)
    index = close + 1
  }

  return result + input.slice(index)
}
