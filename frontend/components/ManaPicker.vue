<template>
    <label class="mana-picker" :for="id" tabindex="0" @keyup.enter="toggle">
        <span class="sr-only">{{ description }}</span>
        <input :id="id" v-model="model" type="checkbox" :value="color" />
        <ManaSymbol class="mana-symbol" :symbol="color" :class="{ 'opacity-50': !isChecked }" aria-hidden="true" />
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
        colorName(): string {
            switch (this.color) {
                case "w":
                    return "White";
                case "u":
                    return "Blue";
                case "b":
                    return "Black";
                case "r":
                    return "Red";
                case "g":
                    return "Green";
                case "c":
                    return "Colorless";
                default:
                    return "";
            }
        },
        isChecked(): boolean {
            return this.value.includes(this.color);
        },
        description(): string {
            return `Color Identity ${this.isChecked ? "includes" : "excludes"} ${this.colorName}. Press Enter key to toggle.`
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
    methods: {
        toggle() {
            const newValue = Array.from(this.value);

            if (this.isChecked) {
                const index = newValue.indexOf(this.color);
                newValue.splice(index, 1);
            } else {
                newValue.push(this.color);
            }

            this.$emit("input", newValue)
        }
    }
});
</script>
<style scoped>
input {
    @apply hidden;
}

.mana-symbol {
    @apply transition-transform cursor-pointer;
}

.mana-symbol:hover {
    @apply scale-125;
}
</style>