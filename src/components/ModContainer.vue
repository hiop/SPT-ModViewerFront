<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {getSptMods, postActiveProfile, postServerMod} from "@/api/api-client.ts";
import type {SPTClientMod, SPTServerMod} from "@/api/api-types.ts";
import SptMod from "@/components/SptMod.vue";
import {useGlobalStore, useSptFilterStore, useSptModStore} from "@/store";
import {SptModState, SptModType} from "@/types/spt-types.ts";
import {getModState, sleep} from "@/script/Utils.ts";

const loading = ref(false);
const globalStore = useGlobalStore();
const filterStore = useSptFilterStore();
const modStore = useSptModStore();
const modFilter = computed({
  get() {
    return filterStore.getModFilter();
  },
  set(filter) {
    return filterStore.setModFilter(filter);
  }
});

const mods = computed(() => {
  return modStore.getMods();
})

const clientMods = computed((): SPTClientMod[] => {
  if (!mods.value?.sptClientMods) return [];

  const _mods = mods.value?.sptClientMods[modFilter.value.activeProfile ?? '?NAME?'] ?? [];
  const _search = modFilter?.value.search ?? '';

  return _mods
      .filter((m: SPTClientMod) => modFilter.value.availableMods.includes(SptModType.CLIENT))
      .filter((m: SPTClientMod) => m.visible !== false)
      .filter((m: SPTClientMod) => JSON.stringify(m).toLowerCase().includes(_search.toLowerCase()))
      .filter((m: SPTClientMod) => {
        const forgeMode = mods.value!.sptForgeMods!.find(f => f.guid === m.guid);
        if (modFilter.value?.modState === SptModState.ANY) return true;

        const lastVersion = forgeMode?.sptVersions[forgeMode.sptVersions?.length - 1];
        return modFilter?.value.modState === getModState(m, lastVersion);
      })
})

onMounted(async () => {
  try {
    await postActiveProfile();
    await postServerMod();
  }catch(e){
    globalStore.setMessage(e?.message)
  }

  await getSptMods().then((response) => {
    modStore.setMods(response);
  })
})

const serverMods = computed(() => {
  const _mods = mods.value?.sptServerMods ?? [];
  const _search = modFilter?.value.search ?? '';

  return _mods
      .filter((m: SPTServerMod) => modFilter.value.availableMods.includes(SptModType.SERVER))
      .filter((m: SPTServerMod) => m.visible !== false)
      .filter((m: SPTServerMod) => JSON.stringify(m).toLowerCase().includes(_search.toLowerCase()))
      .filter((m: SPTServerMod) => {
        const forgeMode = mods.value!.sptForgeMods!.find(f => f.guid === m.guid);
        if (modFilter.value?.modState === SptModState.ANY) return true;

        const lastVersion = forgeMode?.sptVersions[forgeMode.sptVersions?.length - 1];
        return modFilter?.value.modState === getModState(m, lastVersion);
      })
})

const modsInFilter = computed(() => {
  return serverMods.value.length + clientMods.value.length;
});

const SyncAllModsByFilter = async () => {
  loading.value = true;
  let counter = modsInFilter.value;

  for (let s = 0; s < serverMods.value.length; s++) {
    const mod = serverMods.value[s];
    globalStore.setMessage(`Try sync mod ${mod.name}`)

    await modStore.updateForgeMod(mod).finally(() => {
      counter--;
    })
    await sleep(2000);
  }

  for (let c = 0; c < clientMods.value.length; c++) {
    const mod = clientMods.value[c];
    globalStore.setMessage(`Try sync mod ${mod.name}`)

    await modStore.updateForgeMod(mod).finally(() => {
      counter--;
    })
    await sleep(2000);
  }

  loading.value = false;
  globalStore.setMessage(`Sync done!`);
}


</script>

<template>
  <div class="h-100">
    <div class="d-flex align-center">
      <div>
        <v-select
            v-model="modFilter.availableMods"
            :items="Object.values(SptModType)"
            width="300"
            label="Mod types"
            variant="outlined"
            density="compact"
            hide-details="auto"
            multiple
        />
      </div>
      <div>
        <v-select
            v-if="modFilter.availableMods.includes(SptModType.CLIENT)"
            v-model="modFilter.activeProfile"
            class="ml-2"
            :items="Object.keys(mods?.sptClientMods ?? {})"
            width="300"
            label="Player profile"
            variant="outlined"
            density="compact"
            hide-details="auto"
            clearable
        />
      </div>
      <div>
        <v-select
            v-model="modFilter.modState"
            :items="Object.values(SptModState)"
            class="ml-2"
            width="300"
            variant="outlined"
            density="compact"
            hide-details="auto"
            label="Mod state"
        />
      </div>

      <div>
        <v-text-field
            v-model="modFilter.search"
            class="ml-2"
            width="300"
            variant="outlined"
            density="compact"
            label="Search"
            hide-details="auto"
            clearable
        />
      </div>
      <div>
        <v-checkbox
            v-model="modFilter.needThumbnail"
            height="40"
            color="success"
            label="Thumbnail"
            hide-details="auto"
        />
      </div>
      <div>
        <v-btn
            v-tooltip:bottom="`Updates data for mods (via forge api) selected using the filter settings. The number of mods that will be processed is indicated in brackets.
            !!!THIS IS NOT MOD UPDATER!!!
            `"
            :loading="loading"
            class="ml-4"
            height="40"
            color="success"
            variant="flat"
            @click="SyncAllModsByFilter">SYNC MOD DATA ({{ modsInFilter }})
        </v-btn>
      </div>

    </div>

    <div class="h-100 d-flex flex-wrap">
      <SptMod
          v-for="mod in serverMods"
          :server-mod="mod"
          :forge-mods="mods?.sptForgeMods"
          :key="mod.guid"
          style="width: 20%"
      />

      <template v-if="modFilter.activeProfile">
        <SptMod
            v-for="cmod in clientMods"
            :key="cmod.guid"
            :client-mod="cmod"
            :forge-mods="mods!.sptForgeMods"
            style="width: 20%"
        />
      </template>

    </div>
  </div>
</template>
