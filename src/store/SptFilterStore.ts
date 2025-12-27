import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {SptModFilter} from "@/types/spt-types.ts";
import {SptModState} from "@/types/spt-types.ts";
import {ModType} from "@/api/api-types.ts";

/** Spt Filter Store */
export default defineStore(
    'spt-filter',
    () => {
        const sptVersion = ref('4.0.9');
        const modFilter = ref<SptModFilter>({
            availableMods: [ModType.CLIENT, ModType.SERVER],
            modState: SptModState.ANY
        });

        const getModFilter = () => {
            return modFilter.value;
        }
        const setModFilter = (filter:SptModFilter) => {
            return modFilter.value = filter;
        }


        return {sptVersion, modFilter, getModFilter, setModFilter}
    },
    {
      // Data persistence destination
      persist: {
        key: 'spt-filter',
        storage: window.localStorage
      }
    }
);
