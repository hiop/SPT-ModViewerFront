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
            availableMods: Object.keys(ModType),
            modState: SptModState.ANY
        });

        /**
         * Fix [0,1, "CLIENT", "SERVER"] filter available
         */
        const fixModTypeFrom020 = () => {
            modFilter.value.availableMods = modFilter.value.availableMods
                .filter( (mt: number | keyof ModType) => mt !== 0 && mt !== 1)
                .map((mt: unknown) => mt as keyof ModType);
        }

        const getModFilter = () => {
            return modFilter.value;
        }
        const setModFilter = (filter:SptModFilter) => {
            return modFilter.value = filter;
        }


        return {sptVersion, modFilter, getModFilter, setModFilter, fixModType020: fixModTypeFrom020}
    },
    {
      // Data persistence destination
      persist: {
        key: 'spt-filter',
        storage: window.localStorage
      }
    }
);
