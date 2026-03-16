// composables/useAutocomplete.ts

export interface Destination {
  label: string
  description: string
  lat: number
  lon: number
  img: string | null
}

async function fetchWikipediaPhoto(cityName: string): Promise<string | null> {
  try {
    const wiki = await $fetch<any>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`
    )
    return wiki?.thumbnail?.source ?? null
  } catch {
    return null
  }
}

async function searchDestinations(query: string): Promise<Destination[]> {
  if (!query || query.length < 2) return []

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&featuretype=city`

  const results = await $fetch<any[]>(url, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'MonAppVoyage/1.0'
    }
  })

  return Promise.all(
    results.map(async (r) => ({
      label: r.name,
      description: [r.address?.state, r.address?.country].filter(Boolean).join(', '),
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      img: await fetchWikipediaPhoto(r.name),
    }))
  )
}

export function useAutocomplete() {
  const suggestions = ref<Destination[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let debounceTimer: ReturnType<typeof setTimeout>

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
      try {
        suggestions.value = await searchDestinations(query.trim())
      } catch (err: any) {
        error.value = 'Impossible de récupérer les destinations.'
        suggestions.value = []
      } finally {
        loading.value = false
      }
    }, 300)
  }

  function clear() {
    suggestions.value = []
    loading.value = false
    error.value = null
    clearTimeout(debounceTimer)
  }

  return {
    suggestions,
    loading,
    error,
    search,
    clear,
  }
}