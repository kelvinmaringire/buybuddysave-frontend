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
        justify="center"
        class="text-white q-pb-xs"
      >
        <q-route-tab :to="{ name: 'deals'}" icon="home" label="Deals" />
        <q-route-tab icon="favorite" label="Wish" @click="requireLogin" />
        <q-route-tab icon="person_add_alt" label="Requests" @click="requireLogin"/>
        <q-route-tab  icon="people" label="Buddy" @click="requireLogin"/>
        <q-route-tab :to="{ name: 'login'}" icon="login" label="Login" />
      </q-tabs>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup>

import { useQuasar } from 'quasar'

const $q = useQuasar()

function requireLogin () {
  $q.notify({
    type: 'primary',
    message: 'Login is required to use this functionality.',
    position: 'middle'
  })
}

</script>
