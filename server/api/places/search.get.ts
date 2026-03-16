export default defineEventHandler(async (event) => {
  const { destination, categories } = getQuery(event)

  const categoriesMap: Record<string, string> = {
    Culture:     '16000,16032',
    Nature:      '16019',
    Gastronomie: '13000',
    Shopping:    '17000',
    Détente:     '16019',
    Aventure:    '16000'
  }

  const cats = (categories as string)
    ?.split(',')
    .map(c => categoriesMap[c.trim()])
    .filter(Boolean)
    .join(',') || '16000'

  const cleanDestination = (destination as string)?.trim()
  if (!cleanDestination) {
    throw createError({ statusCode: 400, message: 'Destination requise' })
  }

  const params = new URLSearchParams({
    near:       cleanDestination,
    categories: cats,
    limit:      '15',
    sort:       'RATING',
    fields:     'fsq_place_id,name,geocodes,categories,rating,price,hours,photos,tips'
  })

  const res = await fetch(
    `https://places-api.foursquare.com/places/search?${params}`,  // ✅ nouvelle URL
    {
      headers: {
        'Authorization':        `fsq3WUBs1QCgtU/3J19VI2gzpATkLd7l0vvW8svU0h1KEI8=`,  // ✅ Bearer
        'Accept':               'application/json',
        'X-Places-Api-Version': '2025-06-17'  // ✅ version obligatoire
      }
    }
  )

  const data = await res.json()
  console.log('Foursquare response:', data)

  if (!res.ok || !data.results) {
    throw createError({ statusCode: res.status, message: data.message || 'Erreur Foursquare' })
  }

  return data.results.map((p: any) => ({
    id:          p.fsq_place_id,  // ✅ nouveau nom du champ
    nom:         p.name,
    categorie:   p.categories?.[0]?.name || 'Lieu',
    note:        p.rating || 0,
    prix:        p.price || 1,
    coordonnees: {
      lat: p.geocodes?.main?.latitude,
      lng: p.geocodes?.main?.longitude
    },
    horaires:    p.hours?.display || 'Non disponible',
    ouvert:      p.hours?.open_now ?? null,
    photo:       p.photos?.[0] ? `${p.photos[0].prefix}300x300${p.photos[0].suffix}` : null,
    avis:        p.tips?.[0]?.text || null
  })).sort((a: any, b: any) => b.note - a.note)
})