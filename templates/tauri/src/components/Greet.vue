<script setup lang="ts">
import { invoke } from "@tauri-apps/api/tauri";

let greetMsg = $ref("");
let name = $ref("");

async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsg = await invoke("greet", { name });
}
</script>

<template>
    <div class="bg-red-500 p-2 text-red-900 flex gap-2">
        <input
            class="px-2 rounded-lg border-2 border-red-700 bg-transparent outline-none focus:border-red-900"
            v-model="name"
            placeholder="Enter a name..."
        />
        <button class="p-2 px-3 bg-red-300 rounded-lg" type="button" @click="greet()">Greet</button>
    </div>

    <p>{{ greetMsg }}</p>
</template>
