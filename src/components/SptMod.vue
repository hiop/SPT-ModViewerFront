<script setup lang="ts">
import type {HideClientMod, SPTClientMod, SPTForgeMod, SPTServerMod} from "@/api/api-types.ts";
import {computed, ref} from "vue";
import { useSptFilterStore, useSptModStore} from "@/store";
import defaultBg from "@/assets/default_bg.svg";
import {hideProfileMod, hideServerMod} from "@/api/api-client.ts";
import {SptModState} from "@/types/spt-types.ts";

interface Props {
  clientMod?: SPTClientMod
  serverMod?: SPTServerMod
  forgeMods?: SPTForgeMod[]
}

const sptFilterStore = useSptFilterStore();
const sptModStore = useSptModStore();

const loading = ref(false);
const props = defineProps<Props>();
const clientMod = props.clientMod;
const serverMod = props.serverMod;

const filter = computed(() =>{
  return sptFilterStore.getModFilter();
})

const forgeMods = computed(() =>{
  return props.forgeMods;
});

const modIs = computed((): 'SERVER' | 'CLIENT' => {
  return clientMod?.guid ? 'CLIENT' : 'SERVER'
})

const modName = computed(() => {
  return clientMod?.name ?? serverMod?.name
})

const shortModName = computed(() => {
  if (modName.value?.length && modName.value?.length > 20) {
    return modName.value?.substring(0, 20) + '...'
  }

  return modName.value
})

const modVersion = computed(() => {
  return clientMod?.modVersion ?? serverMod?.modVersion
})

const modGuid = computed(() => {
  return clientMod?.guid ?? serverMod?.guid
})

const forgeMod = computed(() => {
  return forgeMods.value?.find(f => f.guid === modGuid.value)
})

const forgeModLastVersion = computed(() => {
  if (!forgeMod.value?.sptVersions) return null;
  return forgeMod.value.sptVersions[forgeMod.value.sptVersions?.length - 1];
})

const updateMod = () => {
  loading.value = true;

  sptModStore.updateForgeMod(clientMod ?? serverMod)
      .finally(() => {
        loading.value = false;
  });
}

const hideMod = () =>{
  loading.value = true;

  if(clientMod?.guid){
    hideProfileMod({clientName: filter.value.activeProfile, guid: modGuid.value} as HideClientMod)
        .then((data) =>{
          if(!data.success) return;
          sptModStore.hideClientMod(filter.value?.activeProfile, clientMod);
        })
        .finally(() =>{
      loading.value = false;
    })
  }else{
    hideServerMod({guid: serverMod!.guid})
        .then((data) =>{
          if(!data.success) return;

          sptModStore.hideServerMod(serverMod)
        })
        .finally(() =>{
      loading.value = false;
    })
  }

}

const modStateColor = computed(() => {
  if (forgeModLastVersion.value?.version) {
    return forgeModLastVersion.value?.version === modVersion.value
        ? 'green'
        : 'red';
  }
  return 'grey';
});

</script>

<template>
  <div>
    <v-card
        :loading="loading"
        class="mr-2 mb-2"
        variant="outlined"
        :style="{'border': 'solid','border-color': modStateColor}"
    >
      <div v-if="filter.needThumbnail">
        <v-img
            height="300px"
            :src="forgeMod?.thumbnail ? forgeMod.thumbnail : defaultBg"
        ></v-img>
      </div>

      <v-card-title>
        <div class="d-flex justify-space-between">
          <div class="d-flex align-center" v-tooltip="`${modName} ${modVersion}`">
            <template v-if="forgeMod && forgeMod.detail_url">
              <a target="_blank" :href="forgeMod.detail_url">{{ shortModName }} {{ modVersion }}</a>
            </template>
            <template v-else>
              {{ shortModName }} {{ modVersion }}
            </template>
          </div>

          <div>
            <v-btn
                v-tooltip="`Menu`"
                variant="text"
                icon
                size="small"
                :loading="loading"
            >
              <v-icon icon="mdi-dots-vertical"/>
              <v-menu activator="parent" :close-on-click="false" :close-on-back="false" >
                <v-list>
                  <v-list-item value="sync">
                    <template #prepend>
                      <v-icon color="success" icon="mdi-update"/>
                    </template>
                    <v-list-item-title @click="updateMod()">Sync data from Forge API</v-list-item-title>
                  </v-list-item>

                  <v-list-item value="hide">
                    <template #prepend>
                      <v-icon color="warning"  icon="mdi-eye-remove"/>
                    </template>
                    <v-list-item-title>
                      <v-list-item-title @click="hideMod()">Hide</v-list-item-title>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </div>

        </div>
      </v-card-title>

      <v-card-subtitle>
        {{ forgeMod?.teaser ?? modGuid }}
      </v-card-subtitle>

      <v-card-actions>
<!--        <v-chip v-if="forgeModLastVersion" class="font-weight-bold" color="grey" variant="flat">-->
<!--          SPT {{ forgeModLastVersion?.spt_version_constraint }}-->
<!--        </v-chip>-->
        <v-chip :color="modStateColor" variant="flat" density="compact">{{ modIs }}</v-chip>
        <v-chip v-if="filter?.modState === SptModState.OUTDATED" color="green" variant="flat" density="compact">
          {{forgeModLastVersion?.version}}
        </v-chip>
      </v-card-actions>
    </v-card>
  </div>
</template>