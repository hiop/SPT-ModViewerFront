<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {getSptMods, postActiveProfile} from "@/api/api-client.ts";
import type {SPTClientMod, SPTServerMod} from "@/api/api-types.ts";
import SptMod from "@/components/SptMod.vue";
import {useGlobalStore, useSptFilterStore, useSptModStore} from "@/store";
import {SptModState} from "@/types/spt-types.ts";
import {getModState, sleep} from "@/script/Utils.ts";

const loading = ref(false);
const globalStore = useGlobalStore();
const modStore = useSptModStore();
const modFilter = computed(() => {
  return useSptFilterStore().getModFilter();
});

const mods = computed(() => {
  return modStore.getMods();
})

const clientMods = computed((): SPTClientMod[] => {
  if (!mods.value?.sptClientMods) return [];

  const _mods = mods.value?.sptClientMods[modFilter.value.activeProfile ?? '?NAME?'] ?? [];
  const _search = modFilter?.value.search ?? '';

  return _mods
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
  await getSptMods().then((response) => {
    modStore.setMods(response);
  })

  await postActiveProfile();
})

const serverMods = computed(() => {
  const _mods = mods.value?.sptServerMods ?? [];
  const _search = modFilter?.value.search ?? '';

  return _mods
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
    <div class="d-flex">
      <div>
        <v-select
            v-model="modFilter.activeProfile"
            :items="Object.keys(mods?.sptClientMods ?? {})"
            width="300"
            label="Profile"
            variant="outlined"
            density="compact"
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
            clearable
        />
      </div>
      <div>
        <v-btn
            :loading="loading"
            class="ml-2"
            height="40"
            color="success"
            variant="flat"
            @click="SyncAllModsByFilter">SYNC DATA ({{ modsInFilter }})
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
