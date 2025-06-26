<template>
  <q-layout view="hhh lpR fFf">

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-primary text-white">
      <q-toolbar class="justify-center">
        <q-tabs
          dense
          no-caps
          align="justify"
          class="text-white q-pb-xs"
        >
          <q-route-tab :to="{ name: 'deals' }" icon="home" label="Deals" />
          <q-route-tab icon="favorite" label="Wish" @click="requireLogin" />
          <q-route-tab icon="person_add_alt" label="Requests" @click="requireLogin" />
          <q-route-tab icon="people" label="Buddy" @click="requireLogin" />
          <q-route-tab :to="{ name: 'login' }" icon="login" label="Login" />
        </q-tabs>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

function requireLogin () {
  $q.notify({
    color: 'negative',
    icon: 'lock',
    message: '<strong>Login Required</strong><br>Log in to access this feature.',
    html: true,
    position: 'bottom',
    timeout: 3000,
    actions: [
      { label: 'Login', color: 'white', handler: () => router.push({ name: 'login' }) },
      { label: 'Dismiss', color: 'white' }
    ]
  })
}
</script>
