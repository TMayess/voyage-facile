import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event) as { q?: string }

  if (!q || q.trim().length < 2) {
    throw createError({ statusCode: 400, message: 'La requête doit contenir au moins 2 caractères' })
  }

  const config = useRuntimeConfig()
  const key = config.locationiqApiKey

  if (!key) {
    throw createError({ statusCode: 500, message: 'Clé LocationIQ non configurée' })
  }

  const url = `https://api.locationiq.com/v1/autocomplete?key=${key}&q=${encodeURIComponent(q.trim())}&limit=10&dedupe=1&tag=place:city,place:town`

  const results = await $fetch<any[]>(url, {
    headers: { 'Accept-Language': 'fr' },
  }).catch(() => [])

  const formatted = results.map((r: any) => ({
    label: r.address?.name || r.display_place || r.display_name.split(',')[0],
    position: [r.address?.state, r.address?.country].filter(Boolean).join(', '),
  }))

  const unique = Array.from(
    new Map(formatted.map((item) => [item.label, item])).values()
  ).slice(0, 6)

  return unique
})
