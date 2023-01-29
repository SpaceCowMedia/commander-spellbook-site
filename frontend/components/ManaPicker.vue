<template>
    <label class="mana-picker" :for="id">
        <input :id="id" v-model="model" type="checkbox" :value="color" />
        <ManaSymbol class="mana-symbol" :symbol="color" :class="{ 'opacity-50': !isChecked }" />
    </label>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import ManaSymbol from "./ManaSymbol.vue";

export default Vue.extend({
    components: {
        ManaSymbol
    },
    props: {
        color: {
            type: String,
            default: ""
        },
        value: {
            type: Array as PropType<string[]>,
            default() {
                return [];
            },
        },
    },
    computed: {
        id(): string {
            return `${this.color}-picker-id`
        },
        isChecked(): boolean {
            return this.value.includes(this.color);
        },
        model: {
            get(): string[] {
                return this.value;
            },
            set(value: string[]): void {
                this.$emit("input", value);
            },
        },
    },
});
</script>
<style scoped>
input {
    visibility: hidden;
}

.mana-symbol {
    @apply transition-transform cursor-pointer;
}

.mana-symbol:hover {
    @apply scale-125;
}
</style>