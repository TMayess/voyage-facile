<script setup lang="ts">
import type { ItineraryModel } from '~/types/itinerary'
import { getUserItineraries } from '~/services/getUserItineraries'

// ─── SEO ────────────────────────────────────────────────────────
useHead({
  title: 'Mes Voyages',
  meta: [{ name: 'description', content: 'Retrouvez tous vos itinéraires créés.' }]
})

// ─── Fetch ──────────────────────────────────────────────────────
const { data: itineraries, pending, error } = await useAsyncData<ItineraryModel[]>(
  'user-itineraries',
  () => getUserItineraries()
)

// ─── Display Maps ───────────────────────────────────────────────
const styleColors: Record<string, string> = {
  Urbanist:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
  Cultural:    'bg-purple-500/10 border-purple-500/30 text-purple-400',
  Attractions: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
  Nature:      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
}

const styleIcons: Record<string, string> = {
  Urbanist:    'i-heroicons-building-office-2',
  Cultural:    'i-heroicons-academic-cap',
  Attractions: 'i-heroicons-star',
  Nature:      'i-heroicons-sun',
}

const affordabilityLabels: Record<number, string> = {
  1: 'Low budget',
  2: 'Budget',
  3: 'Comfortable',
  4: 'Luxury'
}

// ─── Helper : collecte les lieux uniques d'un itinéraire ────────
const getTopPlaces = (item: ItineraryModel, max = 4) => {
  const seen = new Set<string>()
  const places: any[] = []

  for (const step of item.steps ?? []) {
    for (const place of step.places ?? []) {
      if (!seen.has(place.fsq_place_id)) {
        seen.add(place.fsq_place_id)
        places.push(place)
        if (places.length >= max) return places
      }
    }
  }
  return places
}

const getTotalPlaces = (item: ItineraryModel) => {
  const seen = new Set<string>()
  for (const step of item.steps ?? []) {
    for (const place of step.places ?? []) {
      seen.add(place.fsq_place_id)
    }
  }
  return seen.size
}

// ─── Suppression avec dialog custom ─────────────────────────────
const showDeleteDialog = ref(false)
const pendingDeleteId  = ref<string | null>(null)
const deletingId       = ref<string | null>(null)

function openDeleteDialog(id: string, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  pendingDeleteId.value  = id
  showDeleteDialog.value = true
}

function cancelDelete() {
  showDeleteDialog.value = false
  pendingDeleteId.value  = null
}

async function confirmDelete() {
  if (!pendingDeleteId.value) return

  const idToDelete       = pendingDeleteId.value
  showDeleteDialog.value = false
  deletingId.value       = idToDelete

  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', idToDelete)

    if (error) throw error

    if (itineraries.value) {
      itineraries.value = itineraries.value.filter(i => i.id !== idToDelete)
    }
  } catch (err: any) {
    console.error('Erreur suppression:', err.message)
  } finally {
    deletingId.value      = null
    pendingDeleteId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen text-white font-sans pb-20">

    <!-- ───── Header ───── -->
    <div class="bg-gradient-to-b px-5 pt-10 pb-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-2">
          <NuxtLink
            to="/"
            class="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div>
            <p class="text-[10px] font-black tracking-[0.2em] uppercase text-yellow-400 mb-1">Votre collection</p>
            <h1 class="text-3xl font-black tracking-tight text-white">Mes Voyages</h1>
          </div>
        </div>
        <p class="text-gray-500 text-sm mt-3 ml-14">
          {{ itineraries?.length ?? 0 }} itinéraire{{ (itineraries?.length ?? 0) > 1 ? 's' : '' }} créé{{ (itineraries?.length ?? 0) > 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- ───── Loading ───── -->
    <Transition name="fade">
      <div v-if="pending" class="flex flex-col items-center justify-center py-32 gap-5">
        <div class="relative w-14 h-14">
          <div class="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
          <div class="absolute inset-0 rounded-full border-t-2 border-yellow-400 animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-map" class="w-5 h-5 text-yellow-400" />
          </div>
        </div>
        <p class="text-gray-500 text-sm animate-pulse">Chargement de vos voyages…</p>
      </div>
    </Transition>

    <!-- ───── Error ───── -->
    <Transition name="fade">
      <div v-if="error && !pending" class="max-w-2xl mx-auto px-5 pt-16 flex flex-col items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-400" />
        </div>
        <p class="text-gray-500 text-sm text-center">{{ error.message || 'Impossible de charger vos itinéraires.' }}</p>
      </div>
    </Transition>

    <!-- ───── Empty ───── -->
    <Transition name="fade">
      <div
        v-if="!pending && !error && itineraries?.length === 0"
        class="max-w-2xl mx-auto px-5 pt-24 flex flex-col items-center gap-6 text-center"
      >
        <div class="w-20 h-20 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center">
          <UIcon name="i-heroicons-map" class="w-9 h-9 text-gray-700" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white mb-2">Aucun voyage pour l'instant</h2>
          <p class="text-gray-500 text-sm max-w-xs">Créez votre premier itinéraire et retrouvez-le ici.</p>
        </div>
        <NuxtLink
          to="/"
          class="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-black text-sm rounded-2xl transition-all"
        >
          Créer un itinéraire
        </NuxtLink>
      </div>
    </Transition>

    <!-- ───── List ───── -->
    <Transition name="slide-up">
      <div v-if="!pending && itineraries && itineraries.length > 0" class="max-w-2xl mx-auto px-5 pt-6">
        <div class="flex flex-col gap-4">
          <NuxtLink
            v-for="(item, index) in itineraries"
            :key="item.id"
            :to="`/itinerary?id=${item.id}`"
            class="group block rounded-2xl bg-[#1A1A14] border border-[#2A2A20]  hover:border-gray-700 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 overflow-hidden card-item"
            :style="{ animationDelay: `${index * 60}ms` }"
          >
            <div class="p-5">

              <!-- ── Top row ── -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">

                  <!-- Category + affordability badges -->
                  <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      class="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border"
                      :class="styleColors[item.category] || 'bg-gray-800 border-gray-700 text-gray-400'"
                    >
                      <UIcon :name="styleIcons[item.category] || 'i-heroicons-map'" class="w-3 h-3" />
                      {{ item.category }}
                    </span>
                    <span
                      v-if="item.affordability"
                      class="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full"
                    >
                      {{ affordabilityLabels[item.affordability] || '—' }}
                    </span>
                  </div>

                  <!-- Title -->
                  <h2 class="text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-yellow-400 transition-colors">
                    {{ item.name }}
                  </h2>

                  <!-- Description -->
                  <p class="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {{ item.description }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 mt-1">
                  <!-- Bouton supprimer -->
                  <button
                    :disabled="deletingId === item.id"
                    class="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50 transition-all active:scale-95"
                    @click="openDeleteDialog(item.id, $event)"
                  >
                    <UIcon
                      :name="deletingId === item.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
                      class="w-4 h-4"
                      :class="{ 'animate-spin': deletingId === item.id }"
                    />
                  </button>

                  <!-- Arrow -->
                  <div class="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-all">
                    <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </div>

              <!-- ── Aperçu des lieux ── -->
              <div v-if="getTopPlaces(item).length > 0" class="mt-4 flex flex-col gap-1.5">
                <p class="text-[10px] font-black tracking-[0.15em] uppercase text-gray-600 mb-1">Lieux inclus</p>

                <div
                  v-for="place in getTopPlaces(item)"
                  :key="place.fsq_place_id"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-950/60 border border-gray-800/60"
                >
                  <!-- Miniature -->
                  <div class="flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden bg-gray-800">
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

                  <!-- Nom -->
                  <p class="flex-1 min-w-0 text-xs font-semibold text-gray-300 truncate">{{ place.name }}</p>

                  <!-- Rating -->
                  <span
                    v-if="place.rating"
                    class="flex-shrink-0 text-[10px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-md"
                  >
                    ★ {{ place.rating.toFixed(1) }}
                  </span>
                </div>

                <!-- Reste -->
                <p
                  v-if="getTotalPlaces(item) > 4"
                  class="text-[11px] text-gray-600 pl-3 pt-0.5"
                >
                  + {{ getTotalPlaces(item) - 4 }} autres lieux
                </p>
              </div>

              <!-- ── Footer meta ── -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-gray-800">
                <div class="flex items-center gap-1.5 text-xs text-gray-500">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-yellow-400" />
                  {{ item.place }}
                </div>
                <div class="flex items-center gap-1.5 text-xs text-gray-500">
                  <UIcon name="i-heroicons-queue-list" class="w-3.5 h-3.5 text-yellow-400" />
                  {{ item.steps?.length ?? 0 }} étape{{ (item.steps?.length ?? 0) > 1 ? 's' : '' }}
                </div>
                <div class="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                  {{ new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </div>
              </div>

            </div>
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- ───── Dialog suppression custom ───── -->
    <Teleport to="body">
      <Transition name="dialog">
        <div
          v-if="showDeleteDialog"
          class="fixed inset-0 z-50 flex items-center justify-center px-5"
        >
          <!-- Overlay -->
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            @click="cancelDelete"
          />

          <!-- Box -->
          <div class="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5 shadow-2xl">

            <!-- Icône -->
            <div class="flex justify-center">
              <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <UIcon name="i-heroicons-trash" class="w-6 h-6 text-red-400" />
              </div>
            </div>

            <!-- Texte -->
            <div class="text-center space-y-1.5">
              <h3 class="text-lg font-black text-white">Supprimer l'itinéraire ?</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                Cette action est irréversible. L'itinéraire et tous ses lieux seront définitivement supprimés.
              </p>
            </div>

            <!-- Boutons -->
            <div class="flex gap-3">
              <button
                class="flex-1 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm font-bold text-gray-300 transition-all active:scale-[0.98]"
                @click="cancelDelete"
              >
                Annuler
              </button>
              <button
                class="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-sm font-black text-white transition-all active:scale-[0.98]"
                @click="confirmDelete"
              >
                Supprimer
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.card-item {
  animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

/* ── Dialog animation ── */
.dialog-enter-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-active .relative {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.dialog-leave-active {
  transition: opacity 0.15s ease;
}
.dialog-enter-from {
  opacity: 0;
}
.dialog-enter-from .relative {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.dialog-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>