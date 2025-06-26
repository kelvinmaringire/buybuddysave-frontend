<template>
  <q-page class="q-pa-md">
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <q-btn size="lg" flat dense color="white" icon="keyboard_backspace" :to="{ name: 'account'}" />
      <template v-slot:action>
        <div class="text-h6">Change Password</div>
      </template>
    </q-banner>

    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Current Password -->
              <q-input
                filled
                v-model="formData.currentPassword"
                ref="currentPasswordRef"
                label="Current Password *"
                :type="showCurrentPassword ? 'text' : 'password'"
                :rules="[val => !!val || 'Current password is required']"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showCurrentPassword = !showCurrentPassword"
                  />
                </template>
              </q-input>

              <!-- New Password -->
              <q-input
                filled
                v-model="formData.newPassword"
                ref="newPasswordRef"
                label="New Password *"
                :type="showNewPassword ? 'text' : 'password'"
                :rules="[
                  val => !!val || 'New password is required',
                  val => val.length >= 8 || 'Minimum 8 characters',
                  val => /[A-Z]/.test(val) || 'At least one uppercase letter',
                  val => /[a-z]/.test(val) || 'At least one lowercase letter',
                  val => /[0-9]/.test(val) || 'At least one number'
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showNewPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </q-input>

              <!-- Confirm New Password -->
              <q-input
                filled
                v-model="formData.confirmNewPassword"
                ref="confirmNewPasswordRef"
                label="Confirm New Password *"
                :type="showConfirmPassword ? 'text' : 'password'"
                :rules="[
                  val => !!val || 'Please confirm your password',
                  val => val === formData.newPassword || 'Passwords do not match'
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>

              <!-- Password Requirements -->
              <div class="text-caption text-grey-7 q-mt-sm">
                <div>Password must contain:</div>
                <ul class="q-pl-md">
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="row justify-between q-mt-lg">
                <q-btn
                  :to="{ name: 'account'}"
                  label="Cancel"
                  type="reset"
                  color="negative"
                  flat
                />
                <q-btn
                  label="Change Password"
                  type="submit"
                  color="primary"
                  :loading="loading"
                  :disable="!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword"
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
import { ref, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'

const authStore = useAuthStore()
const $q = useQuasar()
const loading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const currentPasswordRef = ref(null)
const newPasswordRef = ref(null)
const confirmNewPasswordRef = ref(null)

const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const onSubmit = async () => {
  loading.value = true
  try {
    // Check if new password and confirmation match
    if (formData.value.newPassword !== formData.value.confirmNewPassword) {
      throw new Error('Passwords do not match')
    }

    // Call the auth store to change password
    await authStore.changePassword({
      current_password: formData.value.currentPassword,
      new_password: formData.value.newPassword,
      user_id: authStore.userId
    })

    // Reset form on success
    formData.value = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }

    // Wait for DOM updates
    await nextTick()

    // Remove focus from QInput components
    currentPasswordRef.value?.resetValidation()
    newPasswordRef.value?.resetValidation()
    confirmNewPasswordRef.value?.resetValidation()

    // Explicitly blur the native input elements
    currentPasswordRef.value?.$el.querySelector('input')?.blur()
    newPasswordRef.value?.$el.querySelector('input')?.blur()
    confirmNewPasswordRef.value?.$el.querySelector('input')?.blur()

    $q.notify({
      type: 'positive',
      message: 'Password changed successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.detail || error.message || 'Failed to change password',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}

/* Password requirements list */
ul {
  list-style-type: none;
  padding-left: 0;
}

ul li::before {
  content: "•";
  color: var(--q-primary);
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}
</style>
