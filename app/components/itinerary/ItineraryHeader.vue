<script setup lang="ts">
import type { ItineraryModel } from '~/types/itinerary'
import { STYLE_COLORS, STYLE_ICONS, getAffordabilityLabel } from '~/utils/itinerary'

defineProps<{
  itinerary: ItineraryModel
  totalDuration: string
  mealCount: number
}>()
</script>

<template>
  <div class="bg-linear-to-b px-5 pt-8 pb-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-start gap-4 mb-5">
        <NuxtLink
          to="/"
          class="mt-1 w-10 h-10 shrink-0 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border"
              :class="STYLE_COLORS[itinerary.category]?.badge || 'bg-gray-800 border-gray-700 text-gray-400'"
            >
              <UIcon :name="STYLE_ICONS[itinerary.category] || 'i-heroicons-map'" class="w-3 h-3" />
              {{ itinerary.category }}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {{ itinerary.name }}
          </h1>
          <p class="text-gray-400 text-sm mt-1.5 leading-relaxed">{{ itinerary.description }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-x-5 gap-y-2">
        <div class="flex items-center gap-1.5 text-sm text-gray-400">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-primary" />
          <span>{{ itinerary.place }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm text-gray-400">
          <UIcon name="i-heroicons-queue-list" class="w-4 h-4 text-primary" />
          <span>{{ itinerary.steps.length }} étape{{ itinerary.steps.length > 1 ? 's' : '' }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm text-gray-400">
          <UIcon name="i-heroicons-clock" class="w-4 h-4 text-primary" />
          <span>{{ totalDuration }}</span>
        </div>
        <div v-if="mealCount > 0" class="flex items-center gap-1.5 text-sm text-gray-400">
          <UIcon name="i-heroicons-building-storefront" class="w-4 h-4 text-orange-400" />
          <span>{{ mealCount }} repas</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm text-gray-400">
          <UIcon name="i-heroicons-currency-euro" class="w-4 h-4 text-green-400" />
          <span>{{ getAffordabilityLabel(itinerary.affordability) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
