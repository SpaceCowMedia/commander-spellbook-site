<template>
    <div class="color-identity-picker">
        <ManaPicker v-model="model" color="w" />
        <ManaPicker v-model="model" color="u" />
        <ManaPicker v-model="model" color="b" />
        <ManaPicker v-model="model" color="r" />
        <ManaPicker v-model="model" color="g" />
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import ManaPicker from "./ManaPicker.vue";

export default Vue.extend({
    components: {
        ManaPicker
    },
    props: {
        chosenColors: {
            type: Array as PropType<string[]>,
            default() {
                return [];
            },
        },
    },
    computed: {
        model: {
            get(): string[] {
                return this.chosenColors;
            },
            set(value: string[]): void {
                this.$emit("input", value);
            },
        }
    }
});
</script>
<style scoped>
.color-identity-picker {
    display: flex;
}
</style>