<script setup lang="ts">
import type { ItineraryModel } from '~/types/itinerary'
import { STYLE_COLORS_FLAT, STYLE_ICONS, AFFORDABILITY_LABELS } from '~/utils/itinerary'

const props = defineProps<{
  item: ItineraryModel
  deletingId: string | null
}>()

defineEmits<{ delete: [id: string, event: MouseEvent] }>()

const topPlaces = computed(() => {
  const seen = new Set<string>()
  const places: any[] = []
  for (const step of props.item.steps ?? []) {
    for (const place of step.places ?? []) {
      if (!seen.has(place.fsq_place_id)) {
        seen.add(place.fsq_place_id)
        places.push(place)
        if (places.length >= 4) return places
      }
    }
  }
  return places
})

const totalPlaces = computed(() => {
  const seen = new Set<string>()
  for (const step of props.item.steps ?? []) {
    for (const place of step.places ?? []) seen.add(place.fsq_place_id)
  }
  return seen.size
})
</script>

<template>
  <NuxtLink
    :to="`/itinerary?id=${item.id}`"
    class="group block rounded-2xl bg-surface border border-divider hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 overflow-hidden card-item"
  >
    <div class="p-5">

      <!-- Top row -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span
              class="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border"
              :class="STYLE_COLORS_FLAT[item.category as keyof typeof STYLE_COLORS_FLAT] || 'bg-gray-800 border-gray-700 text-gray-400'"
            >
              <UIcon :name="STYLE_ICONS[item.category as keyof typeof STYLE_ICONS] || 'i-heroicons-map'" class="w-3 h-3" />
              {{ item.category }}
            </span>
            <span
              v-if="item.affordability"
              class="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full"
            >
              {{ AFFORDABILITY_LABELS[item.affordability] || '—' }}
            </span>
          </div>

          <h2 class="text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
            {{ item.name }}
          </h2>
          <p class="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{{ item.description }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-1">
          <button
            :disabled="deletingId === item.id"
            class="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50 transition-all active:scale-95"
            @click.prevent="$emit('delete', item.id, $event)"
          >
            <UIcon
              :name="deletingId === item.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
              class="w-4 h-4"
              :class="{ 'animate-spin': deletingId === item.id }"
            />
          </button>
          <div class="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </div>
      </div>

      <!-- Aperçu lieux -->
      <div v-if="topPlaces.length > 0" class="mt-4 flex flex-col gap-1.5">
        <p class="text-[10px] font-black tracking-[0.15em] uppercase text-gray-600 mb-1">Lieux inclus</p>
        <div
          v-for="place in topPlaces"
          :key="place.fsq_place_id"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-950/60 border border-gray-800/60"
        >
          <div class="shrink-0 w-7 h-7 rounded-lg overflow-hidden bg-gray-800">
            <img
              v-if="place.photos && place.photos.length > 0"
              :src="`${place.photos[0].prefix}50x50${place.photos[0].suffix}`"
              :alt="place.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3 text-gray-600" />
            </div>
          </div>
          <p class="flex-1 min-w-0 text-xs font-semibold text-gray-300 truncate">{{ place.name }}</p>
          <span v-if="place.rating" class="shrink-0 text-[10px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-md">
            ★ {{ place.rating.toFixed(1) }}
          </span>
        </div>
        <p v-if="totalPlaces > 4" class="text-[11px] text-gray-600 pl-3 pt-0.5">
          + {{ totalPlaces - 4 }} autres lieux
        </p>
      </div>

      <!-- Footer meta -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-gray-800">
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-primary" />
          {{ item.place }}
        </div>
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <UIcon name="i-heroicons-queue-list" class="w-3.5 h-3.5 text-primary" />
          {{ item.steps?.length ?? 0 }} étape{{ (item.steps?.length ?? 0) > 1 ? 's' : '' }}
        </div>
        <div class="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
          <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
          {{ item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' }}
        </div>
      </div>

    </div>
  </NuxtLink>
</template>

<style scoped>
.card-item {
  animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
