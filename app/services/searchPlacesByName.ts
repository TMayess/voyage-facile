
const FSQ_BASE_URL = 'https://places-api.foursquare.com/places/search'

export async function searchPlacesByName(
    query: string,
    near: string,
    limit = 4
) {
    const params = new URLSearchParams({
        near,
        query,
        limit: limit.toString(),
        sort: 'RATING',
        fields: 'fsq_place_id,name,social_media,location,distance,website,description,photos,rating,price,latitude,longitude',
    })

    const res = await fetch(`${FSQ_BASE_URL}?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer MOFXWSGFJ3HLMZ3NLZFNBQPUOAC0D5O5INGKA4WXV1IQOYMS`,
            'Accept': 'application/json',
            'X-Places-Api-Version': '2025-06-17',
        },
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Foursquare API error: ${err}`)
    }

    const data = await res.json()
    return data.results
}