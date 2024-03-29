import {createRouter, createWebHistory} from 'vue-router'
import AudioRoute from '@/modules/audio/router.js'
import PageNotFound from '@/components/PageNotFound.vue'


const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		...AudioRoute,
		{
			path: '/:notFound', component: PageNotFound,
		},
	],
})

export default router
