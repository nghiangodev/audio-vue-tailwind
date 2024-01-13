import App from "./App.vue";
import router from "./router";
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import "./assets/main.css";
import "./index.css";

library.add(fas);

import {createApp} from 'vue/dist/vue.esm-bundler';


const app = createApp(App);


app.use(VueSweetalert2);
app.use(router);

app.component('font-awesome-icon', FontAwesomeIcon).mount("#app");
