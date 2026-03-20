export default defineEventHandler(async () => {

  const fsqId = "4adcda09f964a520e83321e3"

  const FSQ_API_KEY = "HP0F3YMTWA5YXC01O5LFBVDWSMYK2HZC42YFVNLMKVS0UHOS"

  console.log("[API] ID:", fsqId)

  try {

    const res = await fetch(
    `https://places-api.foursquare.com/places/${fsqId}`,
    {
      headers: {
        Authorization: `Bearer ${FSQ_API_KEY}`,
        Accept: 'application/json',
        'X-Places-Api-Version': '2025-06-17'
      },
    }
  )

  return await res.json()
  } catch (err: any) {

    console.error("FSQ ERROR:", err?.data || err)

    throw createError({
      statusCode: err?.response?.status || 500,
      statusMessage: "Foursquare request failed"
    })

  }

})