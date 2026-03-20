export default defineEventHandler(async (event) => {
  const FSQ_API_KEY = useRuntimeConfig().foursquareApiKey
  const { id } = getQuery(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID manquant' })
  }

  try {
    const fields = [
      'fsq_place_id',
      'name',
      'latitude',
      'longitude',
      'location',
      'extended_location',
      'categories',
      'chains',
      'related_places',
      'social_media',
      'website',
      'tel',
      'email',
      'store_id',
      'date_created',
      'date_refreshed',
      'link',
      'placemaker_url',
      'photos',
      'rating',
      'price',
      'hours',
      'description',
    ].join(',')

    const res = await fetch(
      `https://places-api.foursquare.com/places/${id}?fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${FSQ_API_KEY}`,
          Accept: 'application/json',
          'X-Places-Api-Version': '2025-06-17',
        },
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('FSQ ERROR:', err)
      throw createError({ statusCode: res.status, statusMessage: err })
    }

    const place = await res.json()

    // Construire les URLs des photos
    const photos = (place.photos || []).map((photo: any) => ({
      url_original: `${photo.prefix}original${photo.suffix}`,
      url_500: `${photo.prefix}500x500${photo.suffix}`,
      url_300: `${photo.prefix}300x300${photo.suffix}`,
      width: photo.width,
      height: photo.height,
    }))

    const social = place.social_media || {}

    return {
      fsq_place_id: place.fsq_place_id,
      name: place.name,

      // Coordonnées
      latitude: place.latitude,
      longitude: place.longitude,

      // Localisation
      location: place.location,

      // Contact
      website: place.website,
      tel: place.tel,
      email: place.email,

      // Réseaux sociaux — handles bruts (le client construit les URLs)
      social_media: {
        instagram:   social.instagram   || null,
        facebook_id: social.facebook_id || null,
        twitter:     social.twitter     || null,
      },

      // Classement
      categories:     place.categories,
      related_places: place.related_places,

      // Infos
      rating:        place.rating,
      price:         place.price,
      description:   place.description,
      date_refreshed: place.date_refreshed,

      // Médias
      photos,
    }
  } catch (err: any) {
    console.error('FSQ ERROR:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || 'Foursquare request failed',
    })
  }
})