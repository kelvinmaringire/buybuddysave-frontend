<template>
  <q-page>

   <img src="~assets/auth/wave.png" class="wave" alt="login-wave">
 <div class="row" style="height: 90vh">
   <div class="col-0 col-md-6 flex justify-center content-center">
     <img src="~assets/auth/login.svg" class="responsive" alt="login-image">
   </div>
   <div v-bind:class="{'justify-center': $q.screen.md || $q.screen.sm ||$q.screen.xs}"
        class="col-12 col-md-6 flex content-center">
     <q-card v-bind:style="$q.screen.lt.sm ? {'width': '80%'} : {'width': '50%'}">
       <q-card-section>
        <router-link to="/">
         <q-avatar size="103px" class="absolute-center shadow-10">
           <img src="~assets/auth/logo.png" alt="avatar">
         </q-avatar>
        </router-link>
       </q-card-section>
       <q-card-section>
         <div class="q-pt-lg">
           <div class="col text-h6 ellipsis flex justify-center">
             <h2 class="text-h2 text-uppercase q-my-none text-weight-regular">Register</h2>
           </div>
         </div>
       </q-card-section>
       <q-card-section>
         <q-form class="q-gutter-md" @submit.prevent="onRegister">
           <q-input label="Username" v-model="credentials.username">
           </q-input>
           <q-input label="email" v-model="credentials.email">
           </q-input>
           <q-input
           label="Password" :type="isPwd ? 'password' : 'text'" v-model="credentials.password">
             <template v-slot:append>
               <q-icon
                 :name="isPwd ? 'visibility_off' : 'visibility'"
                 class="cursor-pointer"
                 @click="isPwd = !isPwd"
               />
             </template>
           </q-input>
           <q-input label="Confirm Password" :type="isPwd ? 'password' : 'text'" v-model="credentials.confirm_password">
           </q-input>
           <div class="q-ml-md">
             <q-btn class="full-width" color="primary" label="register" type="submit" rounded>
             </q-btn>
             <div class="text-center q-mt-sm q-gutter-lg">
               <router-link class="text-primary"
               :to="{ name: 'password_reset'}">Forgot your password?</router-link>
               <router-link class="text-primary" :to="{ name: 'login'}">Login</router-link>
             </div>
           </div>
         </q-form>
       </q-card-section>
     </q-card>
   </div>
 </div>

  </q-page>
</template>

<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'

defineOptions({
  name: 'RegisterPage'
})

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const isPwd = ref(true)
const credentials = ref({
  username: '',
  email: '',
  password: '',
  confirm_password: ''

})

async function onRegister () {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Fetch all existing users from the store (make sure your store supports this)
  const existingUsers = authStore.users || [] // or await authStore.fetchUsers() if it's async

  const usernameExists = existingUsers.some(user => user.username.toLowerCase() === credentials.value.username)
  const emailExists = existingUsers.some(user => user.email.toLowerCase() === credentials.value.email)

  if (!credentials.value.username || !credentials.value.email || !credentials.value.password || !credentials.value.confirm_password) {
    $q.notify({
      type: 'negative',
      message: 'All fields are required.',
      position: 'top'
    })
  } else if (!emailRegex.test(credentials.value.email)) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a valid email address.',
      position: 'top'
    })
  } else if (credentials.value.password.length < 6) {
    $q.notify({
      type: 'negative',
      message: 'The password must have 6 or more characters.',
      position: 'top'
    })
  } else if (credentials.value.password !== credentials.value.confirm_password) {
    $q.notify({
      type: 'negative',
      message: 'Passwords do not match.',
      position: 'top'
    })
  } else if (usernameExists) {
    $q.notify({
      type: 'negative',
      message: 'Username is already registered.',
      position: 'top'
    })
  } else if (emailExists) {
    $q.notify({
      type: 'negative',
      message: 'Email is already registered.',
      position: 'top'
    })
  } else {
    try {
      credentials.value.username = credentials.value.username.trim().toLowerCase()

      const registrationData = {
        username: credentials.value.username,
        email: credentials.value.email,
        password: credentials.value.password
      }

      await authStore.doRegister(registrationData)

      $q.notify({
        type: 'positive',
        message: 'Registration Successful.',
        position: 'top'
      })

      router.push({ name: 'login' }) // Make sure to import 'router' if you're using Vue Router
    } catch (err) {
      if (err.response.data.detail) {
        $q.notify({
          type: 'negative',
          message: err.response.data.detail,
          position: 'top'
        })
      }
    }
  }
}

</script>

<style scoped>
.wave {
 position: fixed;
 height: 100%;
 left: 0;
 bottom: 0;
 z-index: -1;
}
</style>
