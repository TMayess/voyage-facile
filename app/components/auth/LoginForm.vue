<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox'
  }
]

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/confirm` }
      })
      if (error) toast.add({ title: 'Erreur Google', description: error.message, color: 'error' })
    }
  },
 
]

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { email, password } = payload.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    toast.add({ title: 'Erreur de connexion', description: error.message, color: 'error' })
    return
  }

  toast.add({ title: 'Connecté !', description: 'Bienvenue 👋' })
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
      >
        <template #footer>
          <div class="flex flex-col items-center gap-2">
            <NuxtLink to="/forgot-password" class="text-primary font-medium">
              Mot de passe oublié ?
            </NuxtLink>
            <span>
              Pas encore de compte ?
              <NuxtLink to="/register" class="text-primary font-medium">S'inscrire</NuxtLink>
            </span>
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>