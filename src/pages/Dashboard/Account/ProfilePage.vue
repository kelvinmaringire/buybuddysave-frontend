<template>
  <q-page>
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <q-btn size="lg" flat dense color="white" icon="keyboard_backspace" :to="{ name: 'account'}" />
      <template v-slot:action>
        <div class="text-h6">@{{ formData.username }}</div>
      </template>
    </q-banner>

    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Profile Picture Section -->
              <!--div class="row justify-center q-mb-md">
                <q-avatar size="120px">
                  <img :src="profileImageUrl" v-if="profileImageUrl">
                  <q-icon name="person" size="xl" v-else />
                </q-avatar>
              </div-->

              <!--q-file
                filled
                v-model="profilePictureFile"
                label="Change Profile Picture"
                accept=".jpg,.jpeg,.png,.gif"
                clearable
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="photo_camera" />
                </template>
              </q-file-->

              <!-- Read-only fields -->
              <q-input filled v-model="formData.username" label="Username" readonly />
              <q-input filled v-model="formData.email" label="Email" readonly />

              <!-- Personal Information -->
              <div class="text-h6 q-mt-md q-mb-sm">Personal Information</div>

              <div class="row q-gutter-md">
                <q-input
                  filled
                  v-model="formData.first_name"
                  label="First Name *"
                  class="col"
                  :rules="[val => !!val || 'Required']"
                />
                <q-input
                  filled
                  v-model="formData.last_name"
                  label="Last Name *"
                  class="col"
                  :rules="[val => !!val || 'Required']"
                />
              </div>

              <q-input
                filled
                v-model="formData.dob"
                label="Date of Birth"
                mask="####-##-##"
                :rules="[val => !val || date.isValid(val) || 'Invalid date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dob" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-select
                filled
                v-model="formData.sex"
                :options="sexOptions"
                label="Gender"
                emit-value
                map-options
                clearable
              />

              <!-- Contact Information -->
              <div class="text-h6 q-mt-md q-mb-sm">Contact Information</div>

              <q-input
                filled
                v-model="formData.phone_number"
                label="Phone Number"
                hint="Optional"
              />

              <q-input
                filled
                v-model="formData.physical_address"
                label="Physical Address"
                type="textarea"
                autogrow
                hint="Optional"
              />

              <!-- Action Buttons -->
              <div class="row justify-between q-mt-lg">
                <q-btn
                  :to="{ name: 'account'}"
                  label="Back"
                  type="reset"
                  color="negative"
                  flat
                />
                <q-btn
                  label="Update Profile"
                  type="submit"
                  color="primary"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const $q = useQuasar()
const loading = ref(false)
const profilePictureFile = ref(null)

const sexOptions = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Other', value: 'O' }
]

const formData = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  dob: null,
  sex: null,
  phone_number: null,
  physical_address: null
})

/* Computed property for profile image URL
const profileImageUrl = computed(() => {
  if (profilePictureFile.value) {
    return URL.createObjectURL(profilePictureFile.value)
  }
  return authStore.profile?.pic?.url || null
}) */

// Initialize form with current profile data
const initForm = () => {
  if (authStore.profile) {
    const profile = authStore.profile
    formData.value = {
      username: profile.username,
      email: profile.email,
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      dob: profile.dob ? date.formatDate(profile.dob, 'YYYY-MM-DD') : null,
      sex: profile.sex || null,
      phone_number: profile.phone_number?.toString() || null,
      physical_address: profile.physical_address || null
    }
  }
}

// Submit form
const onSubmit = async () => {
  loading.value = true
  try {
    const dataToSend = new FormData()

    // Append only non-null values
    Object.keys(formData.value).forEach(key => {
      if (formData.value[key] !== null && formData.value[key] !== undefined && formData.value[key] !== '') {
        dataToSend.append(key, formData.value[key])
      }
    })

    // Append profile picture if changed
    if (profilePictureFile.value) {
      dataToSend.append('pic', profilePictureFile.value)
    }

    await authStore.editPartialUser({
      id: authStore.userId,
      ...Object.fromEntries(dataToSend)
    })

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to update profile',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Initialize when component mounts
onMounted(async () => {
  if (!authStore.profile) {
    await authStore.fetchUsers()
  }
  initForm()
})
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
