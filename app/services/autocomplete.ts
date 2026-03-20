export interface Destination {
  label: string
  position: string
  image: string | null
}

export async function getWikipediaImage(cityName: string): Promise<string | null> {
  try {
    const data = await $fetch<any>(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`
    )
    return data.thumbnail?.source || null
  } catch {
    return null
  }
}

export async function searchDestinations(query: string): Promise<Destination[]> {
  if (!query || query.length < 2) return []

  try {
    const results = await $fetch<{ label: string; position: string }[]>('/api/autocomplete', {
      query: { q: query },
    })

    return Promise.all(
      results.map(async (item) => ({
        ...item,
        image: await getWikipediaImage(item.label),
      }))
    )
  } catch {
    return []
  }
}

export function useAutocomplete() {
  const suggestions = ref<Destination[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let debounceTimer: ReturnType<typeof setTimeout>
  let currentSearchId = 0

  async function search(query: string) {
    error.value = null

    if (!query || query.trim().length < 2) {
      suggestions.value = []
      loading.value = false
      return
    }

    clearTimeout(debounceTimer)
    loading.value = true

    debounceTimer = setTimeout(async () => {
      const searchId = ++currentSearchId
      try {
        const results = await searchDestinations(query.trim())
        if (searchId !== currentSearchId) return
        suggestions.value = results
      } catch {
        if (searchId !== currentSearchId) return
        error.value = 'Impossible de récupérer les destinations.'
        suggestions.value = []
      } finally {
        if (searchId === currentSearchId) loading.value = false
      }
    }, 300)
  }

  function clear() {
    suggestions.value = []
    loading.value = false
    error.value = null
    clearTimeout(debounceTimer)
    currentSearchId++
  }

  return { suggestions, loading, error, search, clear }
}
