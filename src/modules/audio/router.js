const AudioRoute = [
    {
        path: "/",
        name: "AudioPage",
        component: () => import('./view/Index.vue'),
        meta: {
            requiresAuth: true,
        },
    },
];

export default AudioRoute;