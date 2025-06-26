const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      { path: '', name: 'deals', component: () => import('pages/FrontDealsPage.vue') },
      { path: ':id', name: 'front_deal', component: () => import('pages/FrontDealDetailPage.vue') },
      { path: 'login', name: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', name: 'register', component: () => import('pages/RegisterPage.vue') },
      { path: 'password_reset', name: 'password_reset', component: () => import('pages/ForgotPasswordPage.vue') },
      {
        path: 'password-reset-confirm/:uidb64/:token',
        name: 'password-reset-confirm',
        component: () => import('pages/PasswordResetConfirmationPage.vue')
      }

    ]
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('src/pages/Dashboard/Store/DealsPage.vue') },
      { path: ':id', name: 'deal', component: () => import('src/pages/Dashboard/Store/DealDetailPage.vue') },
      { path: 'cart', name: 'cart', component: () => import('src/pages/Dashboard/Store/CartPage.vue') },
      { path: 'requests', name: 'requests', component: () => import('src/pages/Dashboard/Store/RequestsPage.vue') },
      { path: 'buddy', name: 'buddy', component: () => import('src/pages/Dashboard/Store/BuddyPage.vue') },
      { path: 'buddy/:id', name: 'chat', component: () => import('src/pages/Dashboard/Store/ChatPage.vue') },
      { path: 'account', name: 'account', component: () => import('src/pages/Dashboard/Account/AccountPage.vue') },
      { path: 'profile', name: 'profile', component: () => import('src/pages/Dashboard/Account/ProfilePage.vue') },
      { path: 'change_password', name: 'change_password', component: () => import('src/pages/Dashboard/Account/ChangePasswordPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
