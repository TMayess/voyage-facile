<script setup lang="ts">
// ─── SEO ────────────────────────────────────────────────────────
useHead({
  title: 'Mon Profil',
  meta: [{ name: 'description', content: 'Modifiez vos informations personnelles.' }]
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// ─── State ──────────────────────────────────────────────────────
const firstName = ref('')
const lastName  = ref('')

const currentPassword = ref('')
const newPassword     = ref('')
const confirmPassword = ref('')

const showCurrent = ref(false)
const showNew     = ref(false)
const showConfirm = ref(false)

const loadingProfile  = ref(false)
const loadingPassword = ref(false)

const profileSuccess  = ref('')
const profileError    = ref('')
const passwordSuccess = ref('')
const passwordError   = ref('')

// ─── Init depuis user metadata ───────────────────────────────────
onMounted(() => {
  if (user.value?.user_metadata) {
    firstName.value = user.value.user_metadata.first_name ?? ''
    lastName.value  = user.value.user_metadata.last_name  ?? ''
  }
})

// ─── Sauvegarder nom / prénom ────────────────────────────────────
async function saveProfile() {
  profileSuccess.value = ''
  profileError.value   = ''

  if (!firstName.value.trim() || !lastName.value.trim()) {
    profileError.value = 'Prénom et nom sont requis.'
    return
  }

  loadingProfile.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName.value.trim(),
        last_name:  lastName.value.trim(),
      }
    })
    if (error) throw error

    // ✅ Force le refresh de la session pour mettre à jour useSupabaseUser()
    await supabase.auth.refreshSession()

    profileSuccess.value = 'Profil mis à jour avec succès.'
  } catch (err: any) {
    profileError.value = err.message || 'Une erreur est survenue.'
  } finally {
    loadingProfile.value = false
  }
}


// ─── Changer mot de passe ────────────────────────────────────────
async function savePassword() {
  passwordSuccess.value = ''
  passwordError.value   = ''

  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Veuillez remplir tous les champs.'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loadingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    if (error) throw error
    passwordSuccess.value = 'Mot de passe mis à jour avec succès.'
    currentPassword.value = ''
    newPassword.value     = ''
    confirmPassword.value = ''
  } catch (err: any) {
    passwordError.value = err.message || 'Une erreur est survenue.'
  } finally {
    loadingPassword.value = false
  }
}

// ─── Initiales avatar ────────────────────────────────────────────
const initials = computed(() => {
  const f = firstName.value?.[0] ?? ''
  const l = lastName.value?.[0]  ?? ''
  return (f + l).toUpperCase() || '?'
})
</script>

<template>
  <div class="min-h-screen  text-white font-sans pb-20">

    <!-- ───── Header ───── -->
    <div class="bg-gradient-to-b  px-5 pt-10 pb-8">
      <div class="max-w-lg mx-auto">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="w-10 h-10 flex-shrink-0 rounded-xl  flex items-center justify-center text-gray-400 hover:text-primary hover:border-yellow-400/50 transition-all"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div>
            <p class="text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-1">Compte</p>
            <h1 class="text-3xl font-black tracking-tight text-white">Mon Profil</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-lg mx-auto px-5 pt-8 space-y-6">

      <!-- ───── Avatar ───── -->
      <div class="flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span class="text-2xl font-black text-black tracking-tight">{{ initials }}</span>
        </div>
      </div>

      <!-- ───── Email (readonly) ───── -->
      <div class="px-4 py-3 rounded-2xl bg-gray-900 border border-gray-800 flex items-center gap-3">
        <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-gray-600 flex-shrink-0" />
        <p class="text-sm text-gray-500 truncate">{{ user?.email }}</p>
        <span class="ml-auto text-[10px] font-bold text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">non modifiable</span>
      </div>

      <!-- ───── Section : Informations personnelles ───── -->
      <div class="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-800">
          <h2 class="text-sm font-black tracking-wide text-white">Informations personnelles</h2>
          <p class="text-xs text-gray-500 mt-0.5">Votre prénom et nom d'affichage</p>
        </div>

        <div class="p-5 space-y-4">

          <!-- Prénom -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-black tracking-[0.12em] uppercase text-gray-500">Prénom</label>
            <div class="relative">
              <UIcon name="i-heroicons-user" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                v-model="firstName"
                type="text"
                placeholder="Votre prénom"
                class="w-full bg-gray-950 border border-gray-800 focus:border-primary/60 focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Nom -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-black tracking-[0.12em] uppercase text-gray-500">Nom</label>
            <div class="relative">
              <UIcon name="i-heroicons-user" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                v-model="lastName"
                type="text"
                placeholder="Votre nom"
                class="w-full bg-gray-950 border border-gray-800 focus:border-primary/60 focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Feedback -->
          <Transition name="fade">
            <div v-if="profileSuccess" class="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 flex-shrink-0" />
              {{ profileSuccess }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="profileError" class="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
              {{ profileError }}
            </div>
          </Transition>

          <!-- Save button -->
          <button
            :disabled="loadingProfile"
            class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-black font-black text-sm py-3 rounded-xl transition-all"
            @click="saveProfile"
          >
            <UIcon v-if="loadingProfile" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
            {{ loadingProfile ? 'Enregistrement…' : 'Sauvegarder' }}
          </button>
        </div>
      </div>

      <!-- ───── Section : Mot de passe ───── -->
      <div class="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-800">
          <h2 class="text-sm font-black tracking-wide text-white">Mot de passe</h2>
          <p class="text-xs text-gray-500 mt-0.5">Choisissez un mot de passe sécurisé (8 caractères minimum)</p>
        </div>

        <div class="p-5 space-y-4">

          <!-- Nouveau mot de passe -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-black tracking-[0.12em] uppercase text-gray-500">Nouveau mot de passe</label>
            <div class="relative">
              <UIcon name="i-heroicons-lock-closed" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                v-model="newPassword"
                :type="showNew ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-gray-950 border border-gray-800 focus:border-primary/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
              <button
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                @click="showNew = !showNew"
              >
                <UIcon :name="showNew ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Confirmer mot de passe -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-black tracking-[0.12em] uppercase text-gray-500">Confirmer le mot de passe</label>
            <div class="relative">
              <UIcon name="i-heroicons-lock-closed" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-gray-950 border border-gray-800 focus:border-primary/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                :class="confirmPassword && newPassword !== confirmPassword ? 'border-red-500/60' : ''"
              />
              <button
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                @click="showConfirm = !showConfirm"
              >
                <UIcon :name="showConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
              </button>
            </div>
            <!-- Indicateur de correspondance -->
            <p
              v-if="confirmPassword && newPassword !== confirmPassword"
              class="text-[11px] text-red-400 pl-1"
            >
              Les mots de passe ne correspondent pas
            </p>
            <p
              v-else-if="confirmPassword && newPassword === confirmPassword"
              class="text-[11px] text-emerald-400 pl-1"
            >
              ✓ Les mots de passe correspondent
            </p>
          </div>

          <!-- Force du mot de passe -->
          <div v-if="newPassword" class="space-y-1.5">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="
                  newPassword.length >= i * 3
                    ? i <= 1 ? 'bg-red-500'
                    : i <= 2 ? 'bg-orange-400'
                    : i <= 3 ? 'bg-primary'
                    : 'bg-emerald-400'
                    : 'bg-gray-800'
                "
              />
            </div>
            <p class="text-[11px] text-gray-600 pl-0.5">
              {{
                newPassword.length < 4 ? 'Trop court' :
                newPassword.length < 7 ? 'Faible' :
                newPassword.length < 10 ? 'Moyen' : 'Fort'
              }}
            </p>
          </div>

          <!-- Feedback -->
          <Transition name="fade">
            <div v-if="passwordSuccess" class="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 flex-shrink-0" />
              {{ passwordSuccess }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="passwordError" class="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
              {{ passwordError }}
            </div>
          </Transition>

          <!-- Save button -->
          <button
            :disabled="loadingPassword"
            class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-black font-black text-sm py-3 rounded-xl transition-all"
            @click="savePassword"
          >
            <UIcon v-if="loadingPassword" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-heroicons-lock-closed" class="w-4 h-4" />
            {{ loadingPassword ? 'Mise à jour…' : 'Changer le mot de passe' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>