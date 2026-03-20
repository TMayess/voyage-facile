
  const FSQ_API_KEY = "MOFXWSGFJ3HLMZ3NLZFNBQPUOAC0D5O5INGKA4WXV1IQOYMS"
export default defineEventHandler(async (event) => {
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

    // Construire les liens réseaux sociaux
    const social = place.social_media || {}
    const socialLinks = {
      instagram: social.instagram ? `https://instagram.com/${social.instagram}` : null,
      facebook: social.facebook_id ? `https://facebook.com/${social.facebook_id}` : null,
      twitter: social.twitter ? `https://twitter.com/${social.twitter}` : null,
    }

    return {
      fsq_place_id: place.fsq_place_id,
      name: place.name,
      link: place.link,
      placemaker_url: place.placemaker_url,

      // Coordonnées
      latitude: place.latitude,
      longitude: place.longitude,

      // Localisation
      location: place.location,
      extended_location: place.extended_location,

      // Contact
      website: place.website,
      tel: place.tel,
      email: place.email,
      social: socialLinks,

      // Classement
      categories: place.categories,
      chains: place.chains,
      related_places: place.related_places,
      store_id: place.store_id,

      // Infos
      rating: place.rating,
      price: place.price,
      hours: place.hours,
      description: place.description,
      date_created: place.date_created,
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