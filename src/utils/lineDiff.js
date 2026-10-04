// Line diff based on the longest common subsequence.
// The previous greedy version marked everything after the first change as
// added and re-appended the originals as removed at the end.
const MAX_CELLS = 250000 // ~500x500 lines; beyond that fall back to a block diff

export function lineDiff(before, after) {
  const a = String(before ?? '').split('\n')
  const b = String(after ?? '').split('\n')
  const n = a.length, m = b.length
  if (n * m > MAX_CELLS) {
    return [...a.map(text => ({ type: 'remove', text })), ...b.map(text => ({ type: 'add', text }))]
  }
  // dp[i][j] = LCS length of a[i:] and b[j:]
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const out = []
  let i = 0, j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: 'same', text: a[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'remove', text: a[i++] }) }
    else { out.push({ type: 'add', text: b[j++] }) }
  }
  while (i < n) out.push({ type: 'remove', text: a[i++] })
  while (j < m) out.push({ type: 'add', text: b[j++] })
  return out
}
