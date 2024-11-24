<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold">AWB Availability</h1>

    <table class="min-w-full mt-4 border border-gray-200">
      <thead>
        <tr class="bg-gray-100">
          <th class="px-4 py-2 border border-gray-300">AWB Carrier</th>
          <th class="px-4 py-2 border border-gray-300">AWB Number</th>
          <th class="px-4 py-2 border border-gray-300">Pieces</th>
          <th class="px-4 py-2 border border-gray-300">Weight</th>
          <th class="px-4 py-2 border border-gray-300">Volume</th>
          <th class="px-4 py-2 border border-gray-300">Shipping Name</th>
          <th class="px-4 py-2 border border-gray-300">SHC</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="record in awbRecords"
          :key="record.id"
          class="even:bg-gray-50 hover:bg-indigo-50"
        >
          <td class="px-4 py-2 border">{{ record.awb_carrier }}</td>
          <td class="px-4 py-2 border">{{ record.awb_number }}</td>
          <td class="px-4 py-2 border">{{ record.number_pcs }}</td>
          <td class="px-4 py-2 border">{{ record.weight }}</td>
          <td class="px-4 py-2 border">{{ record.volume }}</td>
          <td class="px-4 py-2 border">{{ record.shipping_name }}</td>
          <td class="px-4 py-2 border">{{ record.shc }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="awbRecords.length === 0" class="mt-4 text-gray-500">
      No AWB records found for the entered number.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const supabase = useSupabaseClient();
const route = useRoute();

const awbRecords = ref([]);
const awbNumber = route.query.awb || '';

const fetchAWBRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('ffm_telex')
      .select('awb_carrier, awb_number, number_pcs, weight, volume, shipping_name, shc')
      .like('awb_number', `%${awbNumber}%`);

    if (error) {
      console.error('Error fetching AWB records:', error.message);
      return;
    }

    awbRecords.value = data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

onMounted(fetchAWBRecords);
</script>
