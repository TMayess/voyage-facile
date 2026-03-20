const FSQ_BASE_URL = 'https://places-api.foursquare.com/places/ask'

export async function askForPlace(
    location: string,
    query: string,
    context: string
) {
    const params = new URLSearchParams({
        near: location,
        query: query,
        context: context,
        fields: 'categories,fsq_place_id,name,location,distance,website,description,photos,rating,price',
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