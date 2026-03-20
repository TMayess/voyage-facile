<script setup lang="ts">
import type { ItineraryStep } from '~/types/itinerary'
import { MEAL_ICONS } from '~/utils/itinerary'

const props = defineProps<{
  step: ItineraryStep
  index: number
  totalSteps: number
  isActive: boolean
  affordability?: number
  itineraryPlace: string
  isDragged: boolean
  isDragOver: boolean
}>()

defineEmits<{
  'move-up': []
  'move-down': []
  'delete': []
  'search-places': []
  'dragstart': []
  'dragover': [event: DragEvent]
  'dragleave': []
  'drop': []
  'dragend': []
}>()

const highlightedPlaceIndex = computed(() => {
  if (!props.step.places || props.step.places.length === 0) return -1
  if (!props.affordability) return 0
  const idx = props.step.places.findIndex(p => p.price === props.affordability)
  return idx >= 0 ? idx : 0
})
</script>

<template>
  <div
    class="flex gap-4 items-start mb-3 step-item cursor-move transition-all"
    :class="{
      'opacity-50 bg-primary/5 rounded-2xl': isDragged,
      'border-l-2 border-green-400 pl-3': isDragOver
    }"
    draggable="true"
    @dragstart="$emit('dragstart')"
    @dragover="$emit('dragover', $event)"
    @dragleave="$emit('dragleave')"
    @drop="$emit('drop')"
    @dragend="$emit('dragend')"
  >
    <!-- Timeline dot -->
    <div class="shrink-0 mt-5 z-10 relative group">
      <div v-if="step.meal" class="w-10 h-10 rounded-full bg-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center">
        <UIcon :name="MEAL_ICONS[step.meal] || 'i-heroicons-building-storefront'" class="w-4 h-4 text-orange-400" />
      </div>
      <div
        v-else
        class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all"
        :class="isActive
          ? 'bg-primary text-black border-2 border-primary'
          : 'bg-primary/10 border-2 border-primary/30 text-primary'"
      >{{ index + 1 }}</div>
      <div class="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 flex items-center justify-center transition-all">
        <UIcon name="i-heroicons-bars-3" class="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>

    <!-- Card -->
    <div
      class="flex-1 rounded-2xl p-5 border transition-all duration-200"
      :class="isActive
        ? 'bg-primary/5 border-primary/30'
        : 'bg-surface border-divider hover:border-gray-700'"
    >
      <!-- Header -->
      <div class="flex justify-between items-start gap-3 mb-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <p class="text-[10px] font-black tracking-[0.15em] text-gray-500 uppercase">
              {{ step.startHour }} — {{ step.endHour }}
            </p>
            <span v-if="step.meal" class="text-[9px] font-bold tracking-wide bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase">
              {{ step.meal }}
            </span>
          </div>
          <h3 class="text-lg font-extrabold text-white tracking-tight leading-snug">{{ step.step }}</h3>
          <p class="text-[11px] text-gray-600 mt-0.5 font-medium">{{ step.categoryId }}</p>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2 shrink-0">
          <button
            :disabled="index === 0"
            class="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Déplacer vers le haut"
            @click="$emit('move-up')"
          >
            <UIcon name="i-heroicons-arrow-up" class="w-4 h-4" />
          </button>
          <button
            :disabled="index === totalSteps - 1"
            class="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Déplacer vers le bas"
            @click="$emit('move-down')"
          >
            <UIcon name="i-heroicons-arrow-down" class="w-4 h-4" />
          </button>
          <button
            class="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 transition-all"
            title="Rechercher d'autres lieux"
            @click="$emit('search-places')"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
          </button>
          <button
            class="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all"
            title="Supprimer cette étape"
            @click="$emit('delete')"
          >
            <UIcon name="i-heroicons-trash-20-solid" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Places -->
      <div v-if="step.places && step.places.length > 0" class="flex flex-col gap-2.5 mt-3">
        <div
          v-for="(place, placeIndex) in step.places"
          :key="place.fsq_place_id"
          :class="[
            'rounded-xl flex gap-3 items-start transition-all',
            placeIndex === highlightedPlaceIndex
              ? 'bg-linear-to-br from-primary/10 via-primary/5 to-gray-950/70 border-2 border-primary/40 p-4 scale-[1.02] shadow-lg shadow-primary/10'
              : 'bg-gray-950/70 border border-gray-800/80 p-3.5'
          ]"
        >
          <div v-if="place.photos && place.photos.length > 0" class="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-800">
            <img
              :src="place.photos[0].url_300 ?? `${place.photos[0].prefix}100x100${place.photos[0].suffix}`"
              :alt="place.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div v-else class="w-16 h-16 shrink-0 rounded-lg bg-gray-800/60 border border-gray-700/50 flex items-center justify-center">
            <UIcon name="i-heroicons-building-storefront" class="w-6 h-6 text-gray-600" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h4 class="text-sm font-bold text-white leading-tight">{{ place.name }}</h4>
              <div class="flex items-center gap-1.5 shrink-0">
                <span v-if="place.rating" class="text-[10px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-md">
                  ★ {{ place.rating.toFixed(1) }}
                </span>
                <span v-if="place.price" class="text-[10px] font-bold text-gray-400 bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded-md">
                  {{ '€'.repeat(place.price) }}
                </span>
              </div>
            </div>
            <p v-if="place.description" class="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{{ place.description }}</p>
            <p v-if="place.location?.formatted_address || place.location?.address" class="text-[11px] text-gray-600 mt-1 flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3 shrink-0" />
              {{ place.location?.formatted_address || place.location?.address }}
            </p>
            <p v-if="place.distance" class="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
              <UIcon name="i-heroicons-arrows-right-left" class="w-3 h-3 shrink-0" />
              {{ place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km` }}
            </p>
            <div class="flex gap-2 mt-2.5 flex-wrap">
              <a
                :href="`https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + (place.location?.formatted_address || itineraryPlace))}`"
                target="_blank"
                class="flex items-center gap-1 text-[10px] font-bold text-black bg-primary hover:bg-primary-dark px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
              >
                <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
                Maps
              </a>
              <NuxtLink
                v-if="place.fsq_place_id"
                :to="`/itinerary-details?id=${place.fsq_place_id}`"
                class="flex items-center gap-1 text-[10px] font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
              >
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                Voir détails
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- No places fallback -->
      <div v-else class="mt-2 flex gap-2">
        <a
          :href="`https://maps.google.com/?q=${encodeURIComponent(step.step + ' ' + itineraryPlace)}`"
          target="_blank"
          class="flex items-center gap-1.5 text-xs font-bold text-black bg-primary hover:bg-primary-dark px-3.5 py-2 rounded-xl transition-all active:scale-95"
        >
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
          Google Maps
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-item {
  animation: stepIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes stepIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
