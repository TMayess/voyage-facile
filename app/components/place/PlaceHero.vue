<script setup lang="ts">
defineProps<{
  name: string
  photos?: { url_500?: string; url_300?: string; prefix: string; suffix: string }[]
  categories?: { fsq_category_id: string; name: string }[]
  formattedAddress?: string
}>()
</script>

<template>
  <header class="relative h-[500px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
    <div
      class="absolute inset-0 grid gap-1"
      :class="(photos?.length ?? 0) > 1 ? 'grid-cols-[1fr_120px]' : 'grid-cols-1'"
    >
      <div class="relative overflow-hidden">
        <img
          :src="photos?.[0]?.url_500 ?? 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000'"
          class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Photo principale"
        />
      </div>
      <div v-if="(photos?.length ?? 0) > 1" class="flex flex-col gap-1">
        <div v-for="(photo, i) in photos!.slice(1, 4)" :key="i" class="relative flex-1 overflow-hidden">
          <img :src="photo.url_300" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div v-if="i === 2 && (photos?.length ?? 0) > 4" class="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span class="text-white font-black text-xl">+{{ (photos?.length ?? 0) - 4 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute inset-0 bg-linear-to-t from-[#0a0a0b] via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12">
      <div class="flex gap-2 mb-4 flex-wrap">
        <UBadge v-for="cat in categories" :key="cat.fsq_category_id" color="warning" variant="subtle" class="backdrop-blur-md">
          {{ cat.name }}
        </UBadge>
      </div>
      <h1 class="text-4xl md:text-6xl font-black mb-4 leading-tight">{{ name }}</h1>
      <div v-if="formattedAddress" class="flex items-center text-gray-300 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
        <UIcon name="i-heroicons-map-pin" class="mr-2 text-primary" />
        {{ formattedAddress }}
      </div>
    </div>
  </header>
</template>

<style scoped>
header::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
</style>
