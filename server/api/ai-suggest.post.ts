import { defineEventHandler, readBody, createError } from 'h3'
import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { travelInterest, climate, cityType, style } = body as {
    travelInterest: string
    climate: string
    cityType: string
    style: string
  }

  if (!travelInterest || !climate || !cityType) {
    throw createError({ statusCode: 400, message: 'Paramètres manquants' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.googleAiApiKey

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Clé Google AI non configurée' })
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `You are a travel recommendation expert. Based on these preferences, suggest exactly 3 cities (no more, no less) in JSON format.

User Preferences:
- Travel Interest: ${travelInterest}
- Climate: ${climate}
- City Type: ${cityType}
- Itinerary Style: ${style}

Return ONLY a valid JSON response in this exact format, with no additional text:
{
  "destinations": [
    {"label": "City Name", "position": "Country"},
    {"label": "City Name", "position": "Country"},
    {"label": "City Name", "position": "Country"}
  ]
}`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
    })

    const text = response.text || ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse IA invalide')

    const result = JSON.parse(match[0])
    return result.destinations || []
  } catch {
    throw createError({ statusCode: 500, message: 'Erreur lors de la suggestion IA' })
  }
})
