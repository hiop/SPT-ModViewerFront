import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {SptModFilter} from "@/types/spt-types.ts";
import {SptModState} from "@/types/spt-types.ts";

/** Spt Filter Store */
export default defineStore(
    'spt-filter',
    () => {
        const sptVersion = ref('4.0.9');
        const modFilter = ref<SptModFilter>({modState: SptModState.ANY});

        const getModFilter = () => {
            return modFilter.value;
        }

        return {sptVersion, getModFilter}
    },
    {
      // Data persistence destination
      persist: {
        key: import.meta.env.VITE_APP_WEBSTORAGE_NAMESPACE ?? 'vuetify',
        storage: window.sessionStorage
      }
    }
);
