// services/foursquare.ts

const FSQ_API_KEY = 'ZTQYYPSCXVFHK4OHBBWEECAVENTHFSKWVWIVDLGZ31UFB5LQ'

export async function getPlaceDetails() {
  const fsqId = "4adcda09f964a520e83321e3";

  // On définit les champs (Attention: rating, photos et hours peuvent être payants)
  const fields = 'fsq_id,name,location,tel,website,description,social_media,geocodes,rating,photos'

  try {
    const data = await $fetch<any>(`https://places-api.foursquare.com/places/${fsqId}?fields=${fields}`, {
      headers: {
        'Authorization': FSQ_API_KEY,
        'Accept': 'application/json',
        'X-Places-Api-Version': '2025-06-17'
      }
    })
console.log(data)
    return data
  } catch (err) {
    console.error('[Foursquare] Erreur:', err)
    return null
  }
}