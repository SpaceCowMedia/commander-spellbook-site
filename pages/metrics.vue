<template>
  <div class="static-page">
    <ArtCircle
      card-name="lat nams legacy"
      artist="Tom Wanerstrand"
      class="m-auto md:block hidden"
    />
    <h1 class="heading-title">Metrics</h1>

    <table class="table">
      <thead>
        <tr>
          <th width="38%">
            <center>METRIC</center>
          </th>
          <th width="57%">
            <center>IDENTITY</center>
          </th>
          <th width="5%">
            <center>COUNT</center>
          </th>
        </tr>
      </thead>
      <tbody id="metrics"></tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ArtCircle from "@/components/ArtCircle.vue";

export default Vue.extend({
  components: {
    ArtCircle,
  },
});
</script>
