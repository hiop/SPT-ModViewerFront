import { createPinia, type Pinia } from 'pinia';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Pinia Stores
import useConfigStore from '@/store/ConfigStore';
import useGlobalStore from '@/store/GlobalStore.ts';
import useSptFilterStore from '@/store/SptFilterStore.ts';
import useSptModStore from '@/store/SptModStore.ts';

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export { useConfigStore, useGlobalStore, useSptFilterStore, useSptModStore };
