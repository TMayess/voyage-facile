<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'


const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
  label: 'Accueil',
  to: '/',
  icon: 'i-lucide-home', // Icône maison classique
  active: route.path === '/'
}, {
  label: 'Mon Planning',
  to: '/planner',
  icon: 'i-lucide-map-pin-check-inside', // Représente les destinations validées sur une carte
  active: route.path.startsWith('/planner')
}, {
  label: 'Mes Voyages',
  to: '/trips',
  icon: 'i-lucide-briefcase', // Représente les voyages sauvegardés (mallette)
  active: route.path.startsWith('/trips')
}, {
  label: 'Découvrir',
  to: '/explore',
  icon: 'i-lucide-compass', // La boussole pour l'exploration et les suggestions IA
  active: route.path.startsWith('/explore')
}])
</script>

<template>
  <UHeader toggle-side="left">
    <template #title>

<a href="/" class="flex gap-2">
<img src="/assets/images/logo.png" alt="Mon Logo" width="30" height="20" />
<span color="text-primary">Voyages facile</span>
</a>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton>Connexion</UButton>
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items    " orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

