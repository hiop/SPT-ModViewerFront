import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {ApiResponse, SPTClientMod, SPTForgeMod, SptModResponse, SPTServerMod} from "@/api/api-types.ts";
import {updateModByForge} from "@/api/api-client.ts";
import {useGlobalStore} from "@/store/index.ts";


/** Spt Mod Store */
export default defineStore('spt-mod', () => {
        const mods = ref<SptModResponse>();
        const globalStore = useGlobalStore();

        const getMods = () =>{
            return mods.value
        }
        const setMods = (response: ApiResponse<SptModResponse>) =>{
            mods.value = response?.data;
        }

        const hideClientMod = (clientName?: string, clientMod?: SPTClientMod) => {
            if(!clientName || !clientMod) return;

            const clientMods = mods.value!.sptClientMods![clientName] as SPTClientMod[];
            const mod = clientMods?.find(m => m?.guid === clientMod?.guid);

            if(mod?.guid){
                mod!.visible = false;
            }
        }

        const hideServerMod = (serverMod?: SPTServerMod) => {
            const mod = mods.value?.sptServerMods?.find(m => m.guid === serverMod?.guid);

            if(mod?.guid){
                mod!.visible = false;
            }
        }
        const updateForgeMod = async (mod?: SPTServerMod | SPTClientMod) =>{
            if(!mod) return

            return updateModByForge({name: mod.name, guid: mod.guid})
                .then((result) => {
                    if (result?.success === false && result?.message) {
                        globalStore.setMessage(result?.message+ ` | mod=${mod?.name ?? mod.guid}`)
                    }else{
                        const forgeData = result!.data
                        const index =  mods.value?.sptForgeMods?.findIndex(f => f.id === forgeData?.id)
                        if(!forgeData) return;

                        if (index && index !== -1) {
                            mods!.value!.sptForgeMods![index] = forgeData;
                        }else{
                            mods.value!.sptForgeMods!.push(forgeData);
                        }
                    }
                })
        }

        return {mods,getMods, setMods, updateForgeMod, hideServerMod, hideClientMod}
    }
);
