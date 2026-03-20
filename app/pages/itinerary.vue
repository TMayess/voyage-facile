<template>
  <div class="min-h-screen  text-white font-sans pb-32">

    <!-- ───── Loading State ───── -->
    <Transition name="fade">
      <div v-if="pending" class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
          <div class="absolute inset-0 rounded-full border-t-2 border-yellow-400 animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <p class="text-gray-400 text-sm font-medium tracking-wide animate-pulse">Chargement de l'itinéraire…</p>
      </div>
    </Transition>

    <!-- ───── Error State ───── -->
    <Transition name="fade">
      <div v-if="error && !pending" class="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 text-red-400" />
        </div>
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Itinéraire introuvable</h2>
          <p class="text-gray-500 text-sm max-w-xs">{{ error.message || "Impossible de charger cet itinéraire. Veuillez vérifier le lien." }}</p>
        </div>
        <NuxtLink to="/" class="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-xl transition-all">
          Retour à l'accueil
        </NuxtLink>
      </div>
    </Transition>

    <!-- ───── Main Content ───── -->
    <Transition name="slide-up">
      <div v-if="itinerary && !pending">

        <!-- ───── Header ───── -->
        <div class="bg-gradient-to-b  px-5 pt-8 pb-6">
          <div class="max-w-2xl mx-auto">

            <!-- Back + Title -->
            <div class="flex items-start gap-4 mb-5">
              <NuxtLink
                to="/"
                class="mt-1 w-10 h-10 flex-shrink-0 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all"
              >
                <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
              </NuxtLink>
              <div class="flex-1 min-w-0">
                <!-- Style badge -->
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border"
                    :class="styleColors[itinerary.category]?.badge || 'bg-gray-800 border-gray-700 text-gray-400'"
                  >
                    <UIcon :name="styleIcons[itinerary.category] || 'i-heroicons-map'" class="w-3 h-3" />
                    {{ itinerary.category }}
                  </span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {{ itinerary.name }}
                </h1>
                <p class="text-gray-400 text-sm mt-1.5 leading-relaxed">{{ itinerary.description }}</p>
              </div>
            </div>

            <!-- Stats bar -->
            <div class="flex flex-wrap gap-x-5 gap-y-2">
              <div class="flex items-center gap-1.5 text-sm text-gray-400">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-yellow-400" />
                <span>{{ itinerary.place }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-gray-400">
                <UIcon name="i-heroicons-queue-list" class="w-4 h-4 text-yellow-400" />
                <span>{{ itinerary.steps.length }} étape{{ itinerary.steps.length > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-gray-400">
                <UIcon name="i-heroicons-clock" class="w-4 h-4 text-yellow-400" />
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

        <!-- ───── Timeline ───── -->
        <div class="max-w-2xl mx-auto px-5 pt-8">
          <div class="relative">

            <!-- Vertical connector line -->
            <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400/50 via-gray-700/30 to-transparent pointer-events-none" />

            <!-- Steps -->
            <div class="flex flex-col gap-0">
              <template v-for="(step, index) in itinerary.steps" :key="index">
                <div
                  class="flex gap-4 items-start mb-3 step-item cursor-move transition-all"
                  :class="{
                    'opacity-50 bg-yellow-400/5 rounded-2xl': draggedStepIndex === index,
                    'border-l-2 border-green-400 pl-3': dragOverStepIndex === index
                  }"
                  :style="{ animationDelay: `${index * 80}ms` }"
                  draggable="true"
                  @dragstart="onDragStart(index)"
                  @dragover="onDragOver(index, $event)"
                  @dragleave="onDragLeave"
                  @drop="onDrop(index)"
                  @dragend="draggedStepIndex = null; dragOverStepIndex = null"
                >
                  <!-- Timeline dot with drag handle -->
                  <div class="flex-shrink-0 mt-5 z-10 relative group">
                    <div
                      v-if="step.meal"
                      class="w-10 h-10 rounded-full bg-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center"
                    >
                      <UIcon :name="mealIcons[step.meal] || 'i-heroicons-building-storefront'" class="w-4 h-4 text-orange-400" />
                    </div>
                    <div
                      v-else
                      class="w-10 h-10 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 flex items-center justify-center"
                    >
                      <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-yellow-400" />
                    </div>
                    <!-- Drag handle indicator -->
                    <div class="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 flex items-center justify-center transition-all">
                      <UIcon name="i-heroicons-bars-3" class="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <!-- Card -->
                  <div class="flex-1 rounded-2xl p-5 bg-[#1A1A14] border border-[#2A2A20]  hover:border-gray-700 transition-all duration-200">

                    <!-- Card header -->
                    <div class="flex justify-between items-start gap-3 mb-3">
                      <div class="flex-1 min-w-0">
                        <!-- Time range + meal badge -->
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                          <p class="text-[10px] font-black tracking-[0.15em] text-gray-500 uppercase">
                            {{ step.startHour }} — {{ step.endHour }}
                          </p>
                          <span
                            v-if="step.meal"
                            class="text-[9px] font-bold tracking-wide bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase"
                          >
                            {{ step.meal }}
                          </span>
                        </div>
                        <h3 class="text-lg font-extrabold text-white tracking-tight leading-snug">
                          {{ step.step }}
                        </h3>
                        <!-- Category ID as a subtle tag -->
                        <p class="text-[11px] text-gray-600 mt-0.5 font-medium">{{ step.categoryId }}</p>
                      </div>
                      <!-- Action buttons group -->
                      <div class="flex gap-2 flex-shrink-0">
                        <!-- Search places button -->
                        <button
                          @click="openPlaceSearchModal(index)"
                          class="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 transition-all"
                          title="Rechercher d'autres lieux"
                        >
                          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                        </button>
                        <!-- Remove step button -->
                        <button
                          @click="openDeleteConfirm(index)"
                          class="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all"
                          title="Supprimer cette étape"
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
                          placeIndex === getHighlightedPlaceIndex(step)
                            ? 'bg-gradient-to-br from-yellow-400/10 via-yellow-500/5 to-gray-950/70 border-2 border-yellow-400/40 p-4 scale-[1.02] shadow-lg shadow-yellow-400/10'
                            : 'bg-gray-950/70 border border-gray-800/80 p-3.5'
                        ]"
                      >
                        <!-- Place photo -->
                        <div
                          v-if="place.photos && place.photos.length > 0"
                          class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800"
                        >
                          <img
                            :src="`${place.photos[0].prefix}100x100${place.photos[0].suffix}`"
                            :alt="place.name"
                            class="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <!-- Placeholder icon -->
                        <div
                          v-else
                          class="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-800/60 border border-gray-700/50 flex items-center justify-center"
                        >
                          <UIcon name="i-heroicons-building-storefront" class="w-6 h-6 text-gray-600" />
                        </div>

                        <!-- Place info -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-start justify-between gap-2">
                            <h4 class="text-sm font-bold text-white leading-tight">{{ place.name }}</h4>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                              <!-- Rating -->
                              <span
                                v-if="place.rating"
                                class="text-[10px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-md"
                              >
                                ★ {{ place.rating.toFixed(1) }}
                              </span>
                              <!-- Price -->
                              <span
                                v-if="place.price"
                                class="text-[10px] font-bold text-gray-400 bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded-md"
                              >
                                {{ '€'.repeat(place.price) }}
                              </span>
                            </div>
                          </div>
                          <p v-if="place.description" class="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{{ place.description }}</p>
                          <p
                            v-if="place.location?.formatted_address || place.location?.address"
                            class="text-[11px] text-gray-600 mt-1 flex items-center gap-1"
                          >
                            <UIcon name="i-heroicons-map-pin" class="w-3 h-3 flex-shrink-0" />
                            {{ place.location?.formatted_address || place.location?.address }}
                          </p>
                          <!-- Distance -->
                          <p v-if="place.distance" class="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                            <UIcon name="i-heroicons-arrows-right-left" class="w-3 h-3 flex-shrink-0" />
                            {{ place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km` }}
                          </p>

                          <!-- Action buttons -->
                          <div class="flex gap-2 mt-2.5 flex-wrap">
                            <a
                              :href="`https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + (place.location?.formatted_address || itinerary.place))}`"
                              target="_blank"
                              class="flex items-center gap-1 text-[10px] font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
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
                        :href="`https://maps.google.com/?q=${encodeURIComponent(step.step + ' ' + itinerary.place)}`"
                        target="_blank"
                        class="flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-3.5 py-2 rounded-xl transition-all active:scale-95"
                      >
                        <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                        Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Divider line between steps (not after last) -->
                <div v-if="index < itinerary.steps.length - 1" class="ml-5 h-3" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ───── Fixed bottom bar ───── -->
    <Transition name="slide-up-bar">
      <div v-if="itinerary && !pending" class="fixed bottom-0 left-0 right-0 z-50">
        <div class="bg-gradient-to-t from-gray-950 via-gray-950/97 to-transparent pt-6 pb-5 px-5">
          <div class="max-w-2xl mx-auto flex gap-3">
            <button
              class="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-black text-sm py-3.5 rounded-2xl transition-all"
              @click="shareItinerary"
            >
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
              Partager
            </button>
            <NuxtLink
              to="/"
              class="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 active:scale-[0.98] text-gray-300 font-semibold text-sm px-5 py-3.5 rounded-2xl transition-all"
            >
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ───── Delete Confirmation Modal ───── -->
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closeDeleteConfirm"
      >
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <!-- Header -->
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Supprimer l'étape ?</h3>
              <p class="text-gray-400 text-sm mt-1">
                Êtes-vous sûr de vouloir supprimer l'étape <span class="font-semibold text-white">{{ stepToDeleteIndex !== null && itinerary?.steps[stepToDeleteIndex]?.step }}</span> ?
              </p>
            </div>
          </div>
          <!-- Action buttons -->
          <div class="flex gap-3">
            <button
              @click="closeDeleteConfirm"
              class="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold text-sm transition-all"
            >
              Annuler
            </button>
            <button
              @click="confirmDeleteStep"
              :disabled="isRemoving"
              class="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-semibold text-sm transition-all disabled:opacity-50"
            >
              {{ isRemoving ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ───── Place Search Modal ───── -->
    <Transition name="fade">
      <div
        v-if="showPlaceSearchModal"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closePlaceSearchModal"
      >
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-blue-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-white">Rechercher de nouveaux lieux</h3>
              <p class="text-gray-400 text-sm mt-1">
                Trouvez d'autres lieux pour cette étape
              </p>
            </div>
          </div>

          <!-- Search input -->
          <div class="mb-4">
            <div class="flex gap-2">
              <input
                v-model="placeSearchQuery"
                type="text"
                placeholder="Tapez pour rechercher (ex: restaurant, musée...)"
                class="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                @keyup.enter="searchPlacesForStep"
              />
              <button
                @click="searchPlacesForStep"
                :disabled="isSearchingPlaces || placeSearchQuery.length < 2"
                class="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UIcon v-if="isSearchingPlaces" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                <span v-else>Chercher</span>
              </button>
            </div>
          </div>

          <!-- Results -->
          <div v-if="placeSearchResults.length > 0" class="mb-4 max-h-64 overflow-y-auto">
            <p class="text-xs font-semibold text-gray-400 mb-2 uppercase">{{ placeSearchResults.length }} résultats trouvés</p>
            <div class="flex flex-col gap-2">
              <div
                v-for="place in placeSearchResults"
                :key="place.fsq_place_id"
                @click="togglePlaceSelection(place)"
                class="p-3 rounded-lg bg-gray-800 border-2 cursor-pointer transition-all"
                :class="selectedSearchPlaces.some(p => p.fsq_place_id === place.fsq_place_id)
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'"
              >
                <div class="flex items-start gap-2">
                  <!-- Checkbox -->
                  <div
                    class="w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    :class="selectedSearchPlaces.some(p => p.fsq_place_id === place.fsq_place_id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-600'"
                  >
                    <UIcon v-if="selectedSearchPlaces.some(p => p.fsq_place_id === place.fsq_place_id)" name="i-heroicons-check" class="w-3 h-3 text-white" />
                  </div>
                  <!-- Place info -->
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

          <!-- Empty state -->
          <div v-else-if="placeSearchQuery && !isSearchingPlaces" class="mb-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 text-center">
            <p class="text-gray-400 text-sm">Aucun résultat trouvé pour "{{ placeSearchQuery }}"</p>
          </div>

          <!-- Selected places summary -->
          <div v-if="selectedSearchPlaces.length > 0" class="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p class="text-xs font-semibold text-blue-400 mb-2">{{ selectedSearchPlaces.length }} lieu(x) sélectionné(s)</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="place in selectedSearchPlaces"
                :key="place.fsq_place_id"
                class="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {{ place.name }}
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-3">
            <button
              @click="closePlaceSearchModal"
              class="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold text-sm transition-all"
            >
              Annuler
            </button>
            <button
              @click="confirmPlaceReplacement"
              :disabled="isSearchingPlaces || selectedSearchPlaces.length === 0"
              class="flex-1 px-4 py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSearchingPlaces ? 'Sauvegarde...' : 'Remplacer les lieux' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDraggable } from '@vueuse/core'
import type { ItineraryModel, ItineraryStep, FQSPlace } from '~/types/itinerary'
import { getItineraryById } from '~/services/getItineraryById'
import { getLatestItinerary } from '~/services/getLatestItinerary'
import { removeStep, updateItinerary } from '~/services/updateItinerary'

// ─── Route & Query Param ────────────────────────────────────────
const route = useRoute()
const id = computed(() => route.query.id as string)

// ─── Fetch ──────────────────────────────────────────────────────
const { data: itinerary, pending, error } = await useAsyncData<ItineraryModel>(
  () => `itinerary-${id.value || 'latest'}`,
  () => id.value ? getItineraryById(id.value) : getLatestItinerary(),
  { watch: [id] }
)

// ─── SEO ────────────────────────────────────────────────────────
useHead({
  title: computed(() => itinerary.value ? `${itinerary.value.name} — ${itinerary.value.place}` : 'Itinéraire'),
  meta: [
    { name: 'description', content: computed(() => itinerary.value?.description || '') }
  ]
})

// ─── Display Maps ───────────────────────────────────────────────
const styleColors: Record<string, { badge: string }> = {
  Urbanist:    { badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  Cultural:    { badge: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  Attractions: { badge: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' },
  Nature:      { badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
}

const styleIcons: Record<string, string> = {
  Urbanist:    'i-heroicons-building-office-2',
  Cultural:    'i-heroicons-academic-cap',
  Attractions: 'i-heroicons-star',
  Nature:      'i-heroicons-sun',
}

const mealIcons: Record<string, string> = {
  Breakfast: 'i-heroicons-sun',
  Brunch:    'i-heroicons-sun',
  Lunch:     'i-heroicons-clock',
  Snack:     'i-heroicons-cake',
  Dinner:    'i-heroicons-moon',
}

// ─── Computed ───────────────────────────────────────────────────
const mealCount = computed(() =>
  itinerary.value?.steps.filter(s => s.meal).length ?? 0
)

const totalDuration = computed(() => {
  if (!itinerary.value?.steps.length) return '—'
  const steps = itinerary.value.steps
  const first = steps[0]?.startHour
  const last = steps[steps.length - 1]?.endHour
  if (!first || !last) return `${steps.length * 2}h env.`
  return `${first} – ${last}`
})
// ─── Affordability label mapping ────────────────────────────────
const affordabilityLabels: Record<number, string> = {
  1: 'Low budget',
  2: 'Budget',
  3: 'Comfortable',
  4: 'Luxury'
}

const getAffordabilityLabel = (value?: number): string => {
  if (!value) return '—'
  return affordabilityLabels[value] || '—'
}
// ─── Get highlighted place index ─────────────────────────────────
const getHighlightedPlaceIndex = (step: ItineraryStep): number => {
  if (!step.places || step.places.length === 0) return -1
  
  const affordability = itinerary.value?.affordability
  if (!affordability) return 0
  
  // Find a place with price matching the affordability
  const matchingPlaceIndex = step.places.findIndex(place => place.price === affordability)
  
  // If found, return that index; otherwise return 0 (first place)
  return matchingPlaceIndex >= 0 ? matchingPlaceIndex : 0
}

// ─── Social media links helper ───────────────────────────────────
const getSocialMediaLinks = (socialMedia?: any) => {
  if (!socialMedia) return []
  
  const links = []
  if (socialMedia.facebook_id) {
    links.push({
      platform: 'facebook',
      url: `https://www.facebook.com/${socialMedia.facebook_id}`,
      icon: 'i-heroicons-variable',
      label: 'Facebook'
    })
  }
  if (socialMedia.instagram) {
    links.push({
      platform: 'instagram',
      url: `https://www.instagram.com/${socialMedia.instagram}`,
      icon: 'i-heroicons-variable',
      label: 'Instagram'
    })
  }
  if (socialMedia.twitter) {
    links.push({
      platform: 'twitter',
      url: `https://www.twitter.com/${socialMedia.twitter}`,
      icon: 'i-heroicons-variable',
      label: 'X'
    })
  }
  return links
}

// ─── State for interactive features ──────────────────────────────
const isRemoving = ref(false)
const removingStepIndex = ref<number | null>(null)
const showDeleteConfirm = ref(false)
const stepToDeleteIndex = ref<number | null>(null)
const draggedStepIndex = ref<number | null>(null)
const dragOverStepIndex = ref<number | null>(null)
const isSavingOrder = ref(false)
const showPlaceSearchModal = ref(false)
const placeSearchStepIndex = ref<number | null>(null)
const placeSearchQuery = ref('')
const placeSearchResults = ref<FQSPlace[]>([])
const isSearchingPlaces = ref(false)
const selectedSearchPlaces = ref<FQSPlace[]>([])

// ─── Remove step function ───────────────────────────────────────
function openDeleteConfirm(stepIndex: number) {
  stepToDeleteIndex.value = stepIndex
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  stepToDeleteIndex.value = null
}

async function confirmDeleteStep() {
  if (stepToDeleteIndex.value === null || !itinerary.value?.id) return
  try {
    isRemoving.value = true
    removingStepIndex.value = stepToDeleteIndex.value
    await removeStep(itinerary.value.id, stepToDeleteIndex.value, itinerary.value.steps)
    // Fix: Properly update local state to trigger reactivity
    itinerary.value = {
      ...itinerary.value,
      steps: itinerary.value.steps.filter((_, i) => i !== stepToDeleteIndex.value)
    }
    closeDeleteConfirm()
  } catch (err) {
    console.error('Error removing step:', err)
  } finally {
    isRemoving.value = false
    removingStepIndex.value = null
  }
}

// ─── Drag and Drop Functions ─────────────────────────────────────
function onDragStart(index: number) {
  draggedStepIndex.value = index
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  dragOverStepIndex.value = index
}

function onDragLeave() {
  dragOverStepIndex.value = null
}

async function onDrop(dropIndex: number) {
  if (draggedStepIndex.value === null || draggedStepIndex.value === dropIndex || !itinerary.value?.id) {
    draggedStepIndex.value = null
    dragOverStepIndex.value = null
    return
  }

  try {
    isSavingOrder.value = true
    const draggedStep = itinerary.value.steps[draggedStepIndex.value]
    const newSteps = [...itinerary.value.steps]
    newSteps.splice(draggedStepIndex.value, 1)
    newSteps.splice(dropIndex, 0, draggedStep)
    
    // Update in Supabase
    await updateItinerary(itinerary.value.id, { steps: newSteps })
    
    // Update local state with smooth transition
    itinerary.value = {
      ...itinerary.value,
      steps: newSteps
    }
  } catch (err) {
    console.error('Error reordering steps:', err)
  } finally {
    isSavingOrder.value = false
    draggedStepIndex.value = null
    dragOverStepIndex.value = null
  }
}

// ─── Actions ────────────────────────────────────────────────────
async function shareItinerary() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({
      title: itinerary.value?.name || 'Mon itinéraire',
      text: itinerary.value?.description || '',
      url,
    })
  } else {
    await navigator.clipboard.writeText(url)
    // Optionally show a toast: "Lien copié !"
  }
}

// ─── Place Search Modal Functions ─────────────────────────────────
function openPlaceSearchModal(stepIndex: number) {
  placeSearchStepIndex.value = stepIndex
  placeSearchQuery.value = ''
  placeSearchResults.value = []
  selectedSearchPlaces.value = []
  showPlaceSearchModal.value = true
}

function closePlaceSearchModal() {
  showPlaceSearchModal.value = false
  placeSearchStepIndex.value = null
  placeSearchQuery.value = ''
  placeSearchResults.value = []
  selectedSearchPlaces.value = []
}

async function searchPlacesForStep() {
  if (!placeSearchQuery.value || placeSearchQuery.value.length < 2) return
  if (placeSearchStepIndex.value === null) return

  try {
    isSearchingPlaces.value = true

    // Use the itinerary's main place as search context
    const near = itinerary.value?.place || 'Paris'

    // Call backend API to search for places
    const response = await $fetch('/api/places/search', {
      query: {
        query: placeSearchQuery.value,
        near: near,
        limit: '12',
      },
    })

    placeSearchResults.value = response.results || []
  } catch (err) {
    console.error('Error searching places:', err)
  } finally {
    isSearchingPlaces.value = false
  }
}

function togglePlaceSelection(place: FQSPlace) {
  const index = selectedSearchPlaces.value.findIndex(p => p.fsq_place_id === place.fsq_place_id)
  if (index >= 0) {
    selectedSearchPlaces.value.splice(index, 1)
  } else {
    selectedSearchPlaces.value.push(place)
  }
}

async function confirmPlaceReplacement() {
  if (placeSearchStepIndex.value === null || !itinerary.value?.id) return
  if (selectedSearchPlaces.value.length === 0) return

  try {
    isSearchingPlaces.value = true
    const stepIndex = placeSearchStepIndex.value
    
    // Get category name from first selected place
    const firstPlace = selectedSearchPlaces.value[0]
    const categoryName = firstPlace.categories?.[0]?.name || firstPlace.name || 'Activity'
    
    const updatedStep = {
      ...itinerary.value.steps[stepIndex],
      places: selectedSearchPlaces.value,
      step: categoryName // Update step name to category name
    }

    // Update step in Supabase
    const newSteps = [...itinerary.value.steps]
    newSteps[stepIndex] = updatedStep

    await updateItinerary(itinerary.value.id, { steps: newSteps })

    // Immediately update local state for reactive UI
    itinerary.value = {
      ...itinerary.value,
      steps: newSteps
    }

    closePlaceSearchModal()
  } catch (err) {
    console.error('Error replacing places:', err)
  } finally {
    isSearchingPlaces.value = false
  }
}
</script>

<style scoped>
/* ── Step enter animation ── */
.step-item {
  animation: stepIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes stepIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Drag state transition ── */
.step-item.dragging {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.step-item.drag-over {
  transition: border-color 0.2s ease, padding-left 0.2s ease;
}

/* ── Page transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-bar-enter-active {
  transition: opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.slide-up-bar-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

/* ── Clamp ── */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>