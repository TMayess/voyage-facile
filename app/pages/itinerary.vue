<script setup lang="ts">
import type { ItineraryModel, ItineraryStep, FQSPlace } from '~/types/itinerary'
import { getItineraryById } from '~/services/getItineraryById'
import { getLatestItinerary } from '~/services/getLatestItinerary'
import { removeStep, updateItinerary } from '~/services/updateItinerary'

const route = useRoute()
const id = computed(() => route.query.id as string)

const { data: itinerary, pending, error } = await useAsyncData<ItineraryModel>(
  () => `itinerary-${id.value || 'latest'}`,
  () => id.value ? getItineraryById(id.value) : getLatestItinerary(),
  { watch: [id] }
)

useHead({
  title: computed(() => itinerary.value ? `${itinerary.value.name} — ${itinerary.value.place}` : 'Itinéraire'),
  meta: [{ name: 'description', content: computed(() => itinerary.value?.description || '') }]
})

// ── Map state ────────────────────────────────────────────────────
const activeMarkerIndex = ref<number | null>(null)

const stepMarkers = computed(() => {
  if (!itinerary.value?.steps) return []
  return itinerary.value.steps
    .map((step, index) => {
      if (!step.places?.length) return null
      const aff = itinerary.value?.affordability
      const bestIndex = aff ? step.places.findIndex(p => p.price === aff) : -1
      const place = step.places[bestIndex >= 0 ? bestIndex : 0]
      if (!place?.latitude || !place?.longitude) return null
      return {
        index,
        label: index + 1,
        coords: [place.latitude, place.longitude] as [number, number],
        stepName: step.step,
        placeName: place.name,
        startHour: step.startHour,
        endHour: step.endHour,
        meal: step.meal ?? null,
        rating: place.rating ?? null,
        photo: place.photos?.[0] ?? null,
      }
    })
    .filter(Boolean)
})

const mapCenter = computed((): [number, number] => {
  if (!stepMarkers.value.length) return [48.8566, 2.3522]
  const lats = stepMarkers.value.map(m => m!.coords[0])
  const lngs = stepMarkers.value.map(m => m!.coords[1])
  return [
    lats.reduce((a, b) => a + b, 0) / lats.length,
    lngs.reduce((a, b) => a + b, 0) / lngs.length,
  ]
})

// ── Computed stats ───────────────────────────────────────────────
const mealCount = computed(() => itinerary.value?.steps.filter(s => s.meal).length ?? 0)

const totalDuration = computed(() => {
  if (!itinerary.value?.steps.length) return '—'
  const steps = itinerary.value.steps
  const first = steps[0]?.startHour
  const last  = steps[steps.length - 1]?.endHour
  if (!first || !last) return `${steps.length * 2}h env.`
  return `${first} – ${last}`
})

// ── Delete step ──────────────────────────────────────────────────
const isRemoving        = ref(false)
const showDeleteConfirm = ref(false)
const stepToDeleteIndex = ref<number | null>(null)

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
    await removeStep(itinerary.value.id, stepToDeleteIndex.value, itinerary.value.steps)
    itinerary.value = {
      ...itinerary.value,
      steps: itinerary.value.steps.filter((_, i) => i !== stepToDeleteIndex.value)
    }
    closeDeleteConfirm()
  } catch (err) {
    console.error('Erreur suppression étape:', err)
  } finally {
    isRemoving.value = false
  }
}

// ── Drag & Drop ──────────────────────────────────────────────────
const draggedStepIndex  = ref<number | null>(null)
const dragOverStepIndex = ref<number | null>(null)
const isSavingOrder     = ref(false)

function onDragStart(index: number) { draggedStepIndex.value = index }
function onDragOver(index: number, event: DragEvent) { event.preventDefault(); dragOverStepIndex.value = index }
function onDragLeave() { dragOverStepIndex.value = null }

async function onDrop(dropIndex: number) {
  if (draggedStepIndex.value === null || draggedStepIndex.value === dropIndex || !itinerary.value?.id) {
    draggedStepIndex.value = null
    dragOverStepIndex.value = null
    return
  }
  try {
    isSavingOrder.value = true
    const dragged = itinerary.value.steps[draggedStepIndex.value]
    const newSteps = [...itinerary.value.steps]
    newSteps.splice(draggedStepIndex.value, 1)
    newSteps.splice(dropIndex, 0, dragged)
    await updateItinerary(itinerary.value.id, { steps: newSteps })
    itinerary.value = { ...itinerary.value, steps: newSteps }
  } catch (err) {
    console.error('Erreur réorganisation:', err)
  } finally {
    isSavingOrder.value = false
    draggedStepIndex.value = null
    dragOverStepIndex.value = null
  }
}

// ── Move step ────────────────────────────────────────────────────
async function moveStepUp(index: number) {
  if (index === 0 || !itinerary.value?.id) return
  const newSteps: ItineraryStep[] = [...itinerary.value.steps]
  ;[newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]]
  ;[newSteps[index - 1].startHour, newSteps[index].startHour] = [newSteps[index].startHour, newSteps[index - 1].startHour]
  ;[newSteps[index - 1].endHour, newSteps[index].endHour] = [newSteps[index].endHour, newSteps[index - 1].endHour]
  await updateItinerary(itinerary.value.id, { steps: newSteps })
  itinerary.value = { ...itinerary.value, steps: newSteps }
}

async function moveStepDown(index: number) {
  if (!itinerary.value || index === itinerary.value.steps.length - 1) return
  const newSteps: ItineraryStep[] = [...itinerary.value.steps]
  ;[newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]]
  ;[newSteps[index].startHour, newSteps[index + 1].startHour] = [newSteps[index + 1].startHour, newSteps[index].startHour]
  ;[newSteps[index].endHour, newSteps[index + 1].endHour] = [newSteps[index + 1].endHour, newSteps[index].endHour]
  await updateItinerary(itinerary.value.id, { steps: newSteps })
  itinerary.value = { ...itinerary.value, steps: newSteps }
}

// ── Place search ─────────────────────────────────────────────────
const showPlaceSearchModal  = ref(false)
const placeSearchStepIndex  = ref<number | null>(null)

function openPlaceSearchModal(stepIndex: number) {
  placeSearchStepIndex.value = stepIndex
  showPlaceSearchModal.value = true
}

function closePlaceSearchModal() {
  showPlaceSearchModal.value = false
  placeSearchStepIndex.value = null
}

async function onPlaceSearchConfirm(places: FQSPlace[], categoryName: string) {
  if (placeSearchStepIndex.value === null || !itinerary.value?.id) return
  try {
    const stepIndex  = placeSearchStepIndex.value
    const updatedStep = { ...itinerary.value.steps[stepIndex], places, step: categoryName }
    const newSteps   = [...itinerary.value.steps]
    newSteps[stepIndex] = updatedStep
    await updateItinerary(itinerary.value.id, { steps: newSteps })
    itinerary.value = { ...itinerary.value, steps: newSteps }
    closePlaceSearchModal()
  } catch (err) {
    console.error('Erreur remplacement lieux:', err)
  }
}
</script>

<template>
  <div class="min-h-screen text-white font-sans pb-32">

    <!-- Loading -->
    <Transition name="fade">
      <div v-if="pending" class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div class="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-primary" />
          </div>
        </div>
        <p class="text-gray-400 text-sm font-medium tracking-wide animate-pulse">Chargement de l'itinéraire…</p>
      </div>
    </Transition>

    <!-- Error -->
    <Transition name="fade">
      <div v-if="error && !pending" class="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 text-red-400" />
        </div>
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Itinéraire introuvable</h2>
          <p class="text-gray-500 text-sm max-w-xs">{{ error.message || "Impossible de charger cet itinéraire." }}</p>
        </div>
        <NuxtLink to="/" class="px-6 py-3 bg-primary hover:bg-primary-dark text-black font-bold text-sm rounded-xl transition-all">
          Retour à l'accueil
        </NuxtLink>
      </div>
    </Transition>

    <!-- Main content -->
    <Transition name="slide-up">
      <div v-if="itinerary && !pending">

        <ItineraryHeader
          :itinerary="itinerary"
          :total-duration="totalDuration"
          :meal-count="mealCount"
        />

        <ItineraryMap
          v-model:active-marker-index="activeMarkerIndex"
          :step-markers="stepMarkers"
          :map-center="mapCenter"
        />

        <!-- Timeline -->
        <div class="max-w-2xl mx-auto px-5 pt-8">
          <div class="relative">
            <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/50 via-gray-700/30 to-transparent pointer-events-none" />

            <div class="flex flex-col gap-0">
              <template v-for="(step, index) in itinerary.steps" :key="index">
                <ItineraryStepCard
                  :step="step"
                  :index="index"
                  :total-steps="itinerary.steps.length"
                  :is-active="activeMarkerIndex === index"
                  :affordability="itinerary.affordability"
                  :itinerary-place="itinerary.place"
                  :is-dragged="draggedStepIndex === index"
                  :is-drag-over="dragOverStepIndex === index"
                  :style="{ animationDelay: `${index * 80}ms` }"
                  @move-up="moveStepUp(index)"
                  @move-down="moveStepDown(index)"
                  @delete="openDeleteConfirm(index)"
                  @search-places="openPlaceSearchModal(index)"
                  @dragstart="onDragStart(index)"
                  @dragover="onDragOver(index, $event)"
                  @dragleave="onDragLeave"
                  @drop="onDrop(index)"
                  @dragend="draggedStepIndex = null; dragOverStepIndex = null"
                />
                <div v-if="index < itinerary.steps.length - 1" class="ml-5 h-3" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Bottom bar -->
    <Transition name="slide-up-bar">
      <div v-if="itinerary && !pending" class="fixed bottom-0 left-0 right-0 z-50">
        <div class="bg-linear-to-t from-gray-950 via-gray-950/97 to-transparent pt-6 pb-5 px-5">
          <div class="max-w-2xl mx-auto flex gap-3">
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

    <ItineraryDeleteStepModal
      :show="showDeleteConfirm"
      :step-name="stepToDeleteIndex !== null ? itinerary?.steps[stepToDeleteIndex]?.step || '' : ''"
      :is-removing="isRemoving"
      @confirm="confirmDeleteStep"
      @cancel="closeDeleteConfirm"
    />

    <ItineraryPlaceSearchModal
      :show="showPlaceSearchModal"
      :itinerary-place="itinerary?.place || 'Paris'"
      @close="closePlaceSearchModal"
      @confirm="onPlaceSearchConfirm"
    />

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-up-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }

.slide-up-bar-enter-active {
  transition: opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.slide-up-bar-enter-from { opacity: 0; transform: translateY(100%); }
</style>
