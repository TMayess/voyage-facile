const LOCATIONIQ_KEY = 'pk.d2715820e604dea1ed1982a20332f3f9'
export interface Destination {
    label: string
    position: string
    image: string | null
}


// services/destinations/autocomplete.ts

export async function searchDestinations(query: string): Promise<Destination[]> {
    if (!query || query.length < 2) return []

    try {
        const results = await $fetch<any[]>(
            `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&limit=10&dedupe=1&tag=place:city,place:town`,
            { headers: { 'Accept-Language': 'fr' } }
        )

        // 1. On crée une liste propre avec les labels et positions
        const formattedResults = results.map(r => ({
            label: r.address?.name || r.display_place || r.display_name.split(',')[0],
            position: [r.address?.state, r.address?.country].filter(Boolean).join(', '),
        }))

        // 2. On déduplique en fonction du label
        // On utilise Map pour garder uniquement la première occurrence de chaque nom de ville
        const uniqueMap = new Map();

        formattedResults.forEach(item => {
            if (!uniqueMap.has(item.label)) {
                uniqueMap.set(item.label, item);
            }
        });

        // 3. On transforme les valeurs uniques en promesses pour les images Wikipedia
        // On limite à 6 résultats finaux après déduplication
        const finalUniqueResults = Array.from(uniqueMap.values()).slice(0, 6);

        return Promise.all(finalUniqueResults.map(async (item) => {
            const image = await getWikipediaImage(item.label);
            return {
                ...item,
                image: image
            };
        }))

    } catch (err) {
        console.error('[LocationIQ] ❌ Erreur:', err)
        return []
    }
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
            } catch (err: any) {
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