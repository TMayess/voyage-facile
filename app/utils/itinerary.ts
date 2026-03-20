import type { ItineraryStyle, Affordability } from '~/types/itinerary'

export const STYLE_COLORS: Record<ItineraryStyle, { badge: string }> = {
  Urbanist:    { badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  Cultural:    { badge: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  Attractions: { badge: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' },
  Nature:      { badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
}

export const STYLE_COLORS_FLAT: Record<ItineraryStyle, string> = {
  Urbanist:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
  Cultural:    'bg-purple-500/10 border-purple-500/30 text-purple-400',
  Attractions: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
  Nature:      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
}

export const STYLE_ICONS: Record<ItineraryStyle, string> = {
  Urbanist:    'i-heroicons-building-office-2',
  Cultural:    'i-heroicons-academic-cap',
  Attractions: 'i-heroicons-star',
  Nature:      'i-heroicons-sun',
}

export const MEAL_ICONS: Record<string, string> = {
  Breakfast: 'i-heroicons-sun',
  Brunch:    'i-heroicons-sun',
  Lunch:     'i-heroicons-clock',
  Snack:     'i-heroicons-cake',
  Dinner:    'i-heroicons-moon',
}

export const AFFORDABILITY_LABELS: Record<Affordability, string> = {
  1: 'Low budget',
  2: 'Budget',
  3: 'Comfortable',
  4: 'Luxury',
}

export function getAffordabilityLabel(value?: number): string {
  if (!value) return '—'
  return AFFORDABILITY_LABELS[value as Affordability] || '—'
}
