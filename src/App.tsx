import { useMemo, useState } from 'react'

type Separator = '-' | '_' | '.' | ' '

const WORDS = [
  'amber', 'anchor', 'apple', 'arrow', 'atlas', 'aurora', 'badge', 'bamboo', 'beacon', 'berry',
  'blossom', 'breeze', 'bridge', 'brook', 'cactus', 'candle', 'canyon', 'cedar', 'cherry', 'cloud',
  'comet', 'coral', 'cosmic', 'crystal', 'dawn', 'delta', 'desert', 'drift', 'echo', 'ember',
  'falcon', 'feather', 'fjord', 'forest', 'frost', 'galaxy', 'garden', 'glimmer', 'granite', 'harbor',
  'hazel', 'horizon', 'island', 'jade', 'jungle', 'lagoon', 'lantern', 'lemon', 'lotus', 'lunar',
  'maple', 'marble', 'meadow', 'meteor', 'mint', 'monsoon', 'morning', 'nebula', 'oasis', 'ocean',
  'olive', 'onyx', 'opal', 'orbit', 'panda', 'pebble', 'pepper', 'phoenix', 'pine', 'planet',
  'pluto', 'prairie', 'quartz', 'rain', 'raven', 'reef', 'river', 'saffron', 'saturn', 'shadow',
  'silver', 'spruce', 'stone', 'sunrise', 'tiger', 'timber', 'topaz', 'valley', 'velvet', 'violet',
  'wave', 'willow', 'winter', 'zephyr',
] as const

const SYMBOLS = ['!', '@', '#', '$', '%', '&', '*'] as const

const randomInt = (max: number): number => Math.floor(Math.random() * max)

const maybeCapitalize = (word: string, enabled: boolean): string => {
  if (!enabled) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

const formatEntropy = (bits: number): string => {
  if (bits < 40) return `${bits.toFixed(1)} bits (weak)`
  if (bits < 60) return `${bits.toFixed(1)} bits (okay)`
  if (bits < 80) return `${bits.toFixed(1)} bits (strong)`
  return `${bits.toFixed(1)} bits (very strong)`
}

function App() {
  const [wordCount, setWordCount] = useState(4)
  const [separator, setSeparator] = useState<Separator>('-')
  const [capitalize, setCapitalize] = useState(false)
  const [appendNumber, setAppendNumber] = useState(true)
  const [appendSymbol, setAppendSymbol] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [copied, setCopied] = useState(false)

  const entropyBits = useMemo(() => {
    const baseEntropy = wordCount * Math.log2(WORDS.length)
    const numberEntropy = appendNumber ? Math.log2(100) : 0
    const symbolEntropy = appendSymbol ? Math.log2(SYMBOLS.length) : 0
    return baseEntropy + numberEntropy + symbolEntropy
  }, [appendNumber, appendSymbol, wordCount])

  const generatePassphrase = (): void => {
    const chunks = Array.from({ length: wordCount }, () => {
      const word = WORDS[randomInt(WORDS.length)]
      return maybeCapitalize(word, capitalize)
    })

    if (appendNumber) {
      const value = randomInt(100).toString().padStart(2, '0')
      chunks.push(value)
    }

    if (appendSymbol) {
      chunks.push(SYMBOLS[randomInt(SYMBOLS.length)])
    }

    setPassphrase(chunks.join(separator))
    setCopied(false)
  }

  const copyPassphrase = async (): Promise<void> => {
    if (!passphrase) return
    await navigator.clipboard.writeText(passphrase)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-panel p-6 shadow-2xl">
        <h1 className="text-2xl font-bold">Passphrase Generator</h1>
        <p className="mt-1 text-sm text-slate-300">
          Generate memorable, high-entropy passphrases locally in your browser.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Words</span>
            <input
              type="number"
              min={3}
              max={8}
              value={wordCount}
              onChange={(event) => setWordCount(Number(event.target.value))}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Separator</span>
            <select
              value={separator}
              onChange={(event) => setSeparator(event.target.value as Separator)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="-">hyphen (-)</option>
              <option value="_">underscore (_)</option>
              <option value=".">dot (.)</option>
              <option value=" ">space ( )</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} />
            Capitalize words
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={appendNumber} onChange={(e) => setAppendNumber(e.target.checked)} />
            Append 2-digit number
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200 sm:col-span-2">
            <input type="checkbox" checked={appendSymbol} onChange={(e) => setAppendSymbol(e.target.checked)} />
            Append symbol
          </label>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={generatePassphrase}
            className="rounded-md bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400"
          >
            Generate
          </button>
          <button
            onClick={copyPassphrase}
            disabled={!passphrase}
            className="rounded-md border border-slate-600 px-4 py-2 font-medium hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Passphrase</p>
          <p className="mt-2 break-all font-mono text-lg text-emerald-300">{passphrase || '—'}</p>
        </div>

        <p className="mt-4 text-sm text-slate-300">Estimated entropy: {formatEntropy(entropyBits)}</p>
      </div>
    </main>
  )
}

export default App
