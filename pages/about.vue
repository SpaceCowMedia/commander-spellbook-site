<template>
  <div class="static-page">
    <ArtCircle
      card-name="Aeon Chronicler"
      artist="Dan Dos Santos"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">About Commander Spellbook</h1>

    <p>
      The Commander Spellbook project exists to catalog all reasonable
      Commander/EDH combos and to make them easily available across all modern
      digital platforms. This community driven project is used to power
      <a href="https://edhrec.com/combos" target="_blank">
        EDHREC's Combo Feature</a
      >.
    </p>
    <p>
      The database and the source code for the website are
      <a href="https://opensource.org/licenses/MIT" target="_blank">
        completely free and open source under the MIT license</a
      >. We encourage you to copy this data so it lives on!
    </p>

    <ul>
      <li>
        <a
          target="_blank"
          href="https://github.com/Commander-Spellbook/website-v1"
          >Website Source Code on GitHub</a
        >
      </li>
      <li>
        <a
          target="_blank"
          href="https://docs.google.com/spreadsheets/d/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/"
          >Combo Database Backend on Google Sheets</a
        >
      </li>
    </ul>

    <strong>Sincerely, the Community Admins,</strong>
    <ul class="ml-4 list-inside">
      <li>
        <a href="https://www.moxfield.com/users/SeniorEdificer" target="_blank"
          >Senior Edificer</a
        >
      </li>
      <li>
        <a href="https://archidekt.com/user/17861" target="_blank"
          >Goldshot20</a
        >
      </li>
      <li>
        <a href="https://www.moxfield.com/users/AppleSaws" target="_blank"
          >AppleSaws</a
        >
      </li>
      <li>
        <a href="https://twitter.com/lappermedic" target="_blank">Lapper</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";


export default Vue.extend({
  components: {
    ArtCircle
  },
});
</script>

<style scoped>
p,
ul {
  @apply my-2;
}
</style>
