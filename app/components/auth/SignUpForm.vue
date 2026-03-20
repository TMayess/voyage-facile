<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

const fields: AuthFormField[] = [
  { name: 'firstName', type: 'text', label: 'Prénom', placeholder: 'Jean', required: true },
  { name: 'lastName', type: 'text', label: 'Nom', placeholder: 'Dupont', required: true },
  { name: 'email', type: 'email', label: 'Email', placeholder: 'jean.dupont@exemple.fr', required: true },
  { name: 'password', label: 'Mot de passe', type: 'password', placeholder: 'Minimum 8 caractères', required: true },
  { name: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', placeholder: 'Répétez le mot de passe', required: true }
]

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { email, password, firstName, lastName } = payload.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  })

  if (error) {
    toast.add({ title: 'Erreur inscription', description: error.message, color: 'error' })
    return
  }

  toast.add({
    title: 'Compte créé !',
    description: `Bienvenue ${firstName} ! Vérifie ton email pour confirmer ton compte.`
  })

  router.push('/login')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Créer un compte"
        description="Remplissez les informations suivantes pour rejoindre l'aventure."
        icon="i-lucide-user-plus"
        :fields="fields"
        :submit-button="{ label: 'Créer mon compte' }"
        @submit="onSubmit"
      >
        <template #footer>
          Déjà inscrit ?
          <NuxtLink to="/login" class="text-primary font-medium">Se connecter</NuxtLink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>