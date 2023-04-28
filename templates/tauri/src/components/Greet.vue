<script setup lang="ts">
let greetMsg = ref("");
let name = ref("");

const rspc = useRspcClient();

async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const greet = await rspc.query(["version"]);
    greetMsg.value = greet;
}
</script>

<template>
    <div uno:bg="red-500" uno:p="2" uno:text="red-900" class="flex gap-2">
        <input
            uno:bg="transparent"
            uno:border="solid 2 red-700 focus:red-900 rounded-lg"
            class="px-2 outline-none"
            v-model="name"
            placeholder="Enter a name..."
        />
        <button uno:p="2 x-3" uno:bg="red-300 active:red-400" uno:border="none rounded-lg" type="button" @click="greet()">
            Greet
        </button>
    </div>

    <p>{{ greetMsg }}</p>
</template>
