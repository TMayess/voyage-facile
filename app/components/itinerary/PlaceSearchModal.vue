<script setup lang="ts">
import type { FQSPlace } from '~/types/itinerary'

const props = defineProps<{
  show: boolean
  itineraryPlace: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [places: FQSPlace[], categoryName: string]
}>()

const placeSearchQuery    = ref('')
const placeSearchResults  = ref<FQSPlace[]>([])
const isSearchingPlaces   = ref(false)
const selectedSearchPlaces = ref<FQSPlace[]>([])

watch(() => props.show, (val) => {
  if (!val) {
    placeSearchQuery.value = ''
    placeSearchResults.value = []
    selectedSearchPlaces.value = []
  }
})

async function searchPlaces() {
  if (!placeSearchQuery.value || placeSearchQuery.value.length < 2) return
  try {
    isSearchingPlaces.value = true
    const response = await $fetch('/api/places/search', {
      query: { query: placeSearchQuery.value, near: props.itineraryPlace || 'Paris', limit: '12' },
    })
    placeSearchResults.value = (response as any).results || []
  } catch (err) {
    console.error('Erreur recherche lieux:', err)
  } finally {
    isSearchingPlaces.value = false
  }
}

function togglePlace(place: FQSPlace) {
  const index = selectedSearchPlaces.value.findIndex(p => p.fsq_place_id === place.fsq_place_id)
  if (index >= 0) selectedSearchPlaces.value.splice(index, 1)
  else selectedSearchPlaces.value.push(place)
}

function confirmSelection() {
  if (selectedSearchPlaces.value.length === 0) return
  const first = selectedSearchPlaces.value[0]
  const categoryName = first.categories?.[0]?.name || first.name || 'Activity'
  emit('confirm', selectedSearchPlaces.value, categoryName)
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-blue-400" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white">Rechercher de nouveaux lieux</h3>
            <p class="text-gray-400 text-sm mt-1">Trouvez d'autres lieux pour cette étape</p>
          </div>
        </div>

        <div class="mb-4 flex gap-2">
          <input
            v-model="placeSearchQuery"
            type="text"
            placeholder="Tapez pour rechercher (ex: restaurant, musée...)"
            class="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            @keyup.enter="searchPlaces"
          />
          <button
            :disabled="isSearchingPlaces || placeSearchQuery.length < 2"
            class="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="searchPlaces"
          >
            <UIcon v-if="isSearchingPlaces" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span v-else>Chercher</span>
          </button>
        </div>

        <div v-if="placeSearchResults.length > 0" class="mb-4 max-h-64 overflow-y-auto">
          <p class="text-xs font-semibold text-gray-400 mb-2 uppercase">{{ placeSearchResults.length }} résultats trouvés</p>
          <div class="flex flex-col gap-2">
            <div
              v-for="place in placeSearchResults"
              :key="place.fsq_place_id"
              class="p-3 rounded-lg bg-gray-800 border-2 cursor-pointer transition-all"
              :class="selectedSearchPlaces.some(p => p.fsq_place_id === place.fsq_place_id)
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'"
              @click="togglePlace(place)"
            >
              <div class="flex items-start gap-2">
                <div
                  class="w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                  :class="selectedSearchPlaces.some(p => p.fsq_place_id === place.fsq_place_id) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'"
                >
                  <UIcon v-if="selectedSearchPlaces.some(p => p.fsq_place_id === place.fsq_place_id)" name="i-heroicons-check" class="w-3 h-3 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-bold text-white">{{ place.name }}</h4>
                  <p v-if="place.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ place.description }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="place.rating" class="text-xs font-semibold text-yellow-400">★ {{ place.rating.toFixed(1) }}</span>
                    <span v-if="place.price" class="text-xs text-gray-400">{{ '€'.repeat(place.price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="placeSearchQuery && !isSearchingPlaces" class="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 text-center">
          <p class="text-gray-400 text-sm">Aucun résultat pour "{{ placeSearchQuery }}"</p>
        </div>

        <div v-if="selectedSearchPlaces.length > 0" class="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p class="text-xs font-semibold text-blue-400 mb-2">{{ selectedSearchPlaces.length }} lieu(x) sélectionné(s)</p>
          <div class="flex flex-wrap gap-2">
            <div v-for="place in selectedSearchPlaces" :key="place.fsq_place_id" class="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {{ place.name }}
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold text-sm transition-all"
            @click="$emit('close')"
          >
            Annuler
          </button>
          <button
            :disabled="isSearchingPlaces || selectedSearchPlaces.length === 0"
            class="flex-1 px-4 py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="confirmSelection"
          >
            {{ isSearchingPlaces ? 'Sauvegarde...' : 'Remplacer les lieux' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
