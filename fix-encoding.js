const fs = require('fs')
const path = require('path')

// Use unicode escapes to avoid file encoding issues
const fixes = [
  ['\u00f0\u009f\u0094\u0085', '\uD83D\uDCC5'],   // 📅
  ['\u00f0\u009f\u0092\u00ac', '\uD83D\uDCAC'],   // 💬
  ['\u00f0\u009f\u0094\u0084', '\uD83D\uDCC4'],   // 📄
  ['\u00c3\u00a2\u00c5\u0093\u00cf\u00b8', '\u270F\uFE0F'], // ✏️
  ['\u00f0\u009f\u0096\u00bc\u00ef\u00b8\u008f', '\uD83D\uDDBC\uFE0F'], // 🖼️
  ['\u00f0\u009f\u0094\u00a6', '\uD83D\uDCE6'],   // 📦
  ['\u00f0\u009f\u0097\u009d\u00ef\u00b8\u008f', '\uD83D\uDDD3\uFE0F'], // 🗓️
  ['\u00f0\u009f\u0092\u00a5', '\uD83D\uDC65'],   // 👥
  ['\u00f0\u009f\u0094\u008a', '\uD83D\uDCCA'],   // 📊
  ['\u00f0\u009f\u0092\u00b0', '\uD83D\uDCB0'],   // 💰
  ['\u00f0\u009f\u0094\u0092', '\uD83D\uDD12'],   // 🔒
  ['\u00f0\u009f\u008e\u00af', '\uD83C\uDFAF'],   // 🎯
  ['\u00f0\u009f\u0092\u00b8', '\uD83D\uDCB8'],   // 💸
  ['\u00f0\u009f\u00a6', '\uD83C\uDFE6'],         // 🏦
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u009d', '\u2014'], // —
  ['\u00c3\u0082\u00c2\u00a3', '\u00A3'],          // £
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00a6', '\u20A6'], // ₦
  ['\u00c3\u00b0\u00c5\u00b8\u00e2\u0080\u009d\u00c2\u0085', '\uD83D\uDCC5'], // 📅 alt
  ['d\u015a\u201e\u0085', '\uD83D\uDCC5'], // another variant
]

function fixFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath)
    let content = buf.toString('utf8')
    let changed = false
    
    // Simple approach: re-encode mojibake
    // Latin1 -> UTF8 double encoding fix
    try {
      const latin = Buffer.from(content, 'utf8')
      const reread = latin.toString('latin1')
      const fixed = Buffer.from(reread, 'latin1').toString('utf8')
      if (fixed !== content && fixed.length < content.length * 1.5) {
        // Check if fixed has more valid emoji
        const emojiCount = (fixed.match(/[\u{1F300}-\u{1FFFF}]/gu) || []).length
        const origCount  = (content.match(/[\u{1F300}-\u{1FFFF}]/gu) || []).length
        if (emojiCount > origCount) {
          content = fixed
          changed = true
        }
      }
    } catch(e) {}

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log('Fixed:', filePath)
    }
  } catch(e) {
    console.error('Error:', filePath, e.message)
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full)
    else if (item.endsWith('.tsx') || item.endsWith('.ts')) fixFile(full)
  }
}

walk('src')
console.log('Done!')