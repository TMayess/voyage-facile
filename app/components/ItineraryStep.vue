<template>
  <div class="flex gap-4 items-start">
    <!-- Timeline dot -->
    <div class="flex-shrink-0 mt-5">
      <div
        v-if="step.status === 'confirmed'"
        class="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20"
      >
        <UIcon name="i-heroicons-check" class="w-4 h-4 text-black" />
      </div>
      <div
        v-else-if="step.type === 'restaurant'"
        class="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center"
      >
        <UIcon name="i-heroicons-building-storefront" class="w-4 h-4 text-orange-400" />
      </div>
      <div
        v-else
        class="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center"
      >
        <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-yellow-400" />
      </div>
    </div>

    <!-- Card -->
    <div
      class="flex-1 rounded-2xl p-5 border transition-all duration-200"
      :class="step.status === 'confirmed'
        ? 'bg-gray-900 border-gray-700'
        : 'bg-gray-950 border-gray-800'"
    >
      <!-- Card Header -->
      <div class="flex justify-between items-start gap-3 mb-4">
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-black tracking-[0.15em] text-gray-500 uppercase mb-1">
            <span v-if="step.status === 'confirmed'">Étape confirmée</span>
            <span v-else-if="step.type === 'restaurant'">Restaurant suggéré</span>
            <span v-else>Suggestion IA</span>
          </p>
          <h3 class="text-xl font-extrabold text-white tracking-tight leading-snug">
            {{ step.time }} — {{ step.name }}
          </h3>
          <p class="text-sm text-gray-400 mt-1 italic leading-relaxed">
            {{ step.description }}
          </p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <span
            v-if="step.premium"
            class="text-[9px] font-black tracking-[0.12em] bg-yellow-400 text-black px-2.5 py-0.5 rounded-full uppercase"
          >
            Premium
          </span>
          <span
            v-if="step.type === 'restaurant'"
            class="text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full"
          >
            🍽️ Resto
          </span>
          <button
            v-if="step.status === 'confirmed'"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            @click="$emit('remove', step.id)"
          >
            <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Confirmed: map preview + action buttons -->
      <div v-if="step.status === 'confirmed' && step.mapUrl" class="flex gap-3 items-stretch">
        <div class="w-44 flex-shrink-0 rounded-xl overflow-hidden bg-gray-800 h-[90px]">
          <img :src="step.mapUrl" alt="Aperçu carte" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <a
            :href="`https://maps.google.com/?q=${encodeURIComponent(step.name + ' Paris')}`"
            target="_blank"
            class="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-bold text-sm py-2.5 px-4 rounded-xl transition-all flex-1"
          >
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            Google Maps
          </a>
          <button
            class="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all flex-1"
            @click="$emit('details', step)"
          >
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
            Détails
          </button>
        </div>
      </div>

      <!-- Confirmed without map -->
      <div v-else-if="step.status === 'confirmed' && !step.mapUrl" class="flex gap-2">
        <a
          :href="`https://maps.google.com/?q=${encodeURIComponent(step.name + ' Paris')}`"
          target="_blank"
          class="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-bold text-sm py-2.5 px-4 rounded-xl transition-all"
        >
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
          Google Maps
        </a>
        <button
          class="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all"
          @click="$emit('details', step)"
        >
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
          Détails
        </button>
      </div>

      <!-- Suggestion: confirm / replace -->
      <div v-if="step.status === 'suggestion'" class="flex gap-3 mt-1">
        <button
          class="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-bold text-sm py-3 rounded-xl transition-all"
          @click="$emit('confirm', step.id)"
        >
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
          Confirmer
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 active:scale-95 text-gray-300 hover:text-white font-semibold text-sm py-3 rounded-xl transition-all"
          @click="$emit('replace', step.id)"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          Remplacer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  step: {
    type: Object,
    required: true
  }
})

defineEmits(['remove', 'confirm', 'replace', 'details'])
</script>