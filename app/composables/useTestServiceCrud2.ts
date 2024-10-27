<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Database } from '@/types/supabase';

const supabase = useSupabaseClient<Database>();
const {
  services,
  fetchAllServices,
  fetchServiceById,
  insertService,
  updateService,
  deleteService,
} = useTestServiceCrud();

const serviceData = ref({
  service_type_id: '',
  status: 'Draft', // Set default status to Draft
  customer_id: '',
  service_date: '',
  description: '',
});

const serviceTypes = ref([]);
const customers = ref([]);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

// Fetch all data related to services
onMounted(async () => {
  await fetchAllServices();
  await fetchRelatedData();
});

// Fetch related table data for select options
async function fetchRelatedData() {
  const { data: types } = await supabase.from('servicetype').select('id, type_name');
  serviceTypes.value = types || [];

  const { data: customerList } = await supabase.from('customers').select('id, full_name');
  customers.value = customerList || [];
}

// Insert new service record
async function handleInsertService() {
  // Check user role
  const user = supabase.auth.user();
  if (user && user.app_metadata.role === 'customer') {
    // Set status to Draft when creating a new service
    serviceData.value.status = 'Draft';
    await insertService(serviceData.value);
    resetForm();
    await fetchAllServices();
  } else {
    alert('You do not have permission to create a service.');
  }
}

// Update existing service record
async function handleUpdateService() {
  if (editingId.value) {
    // Change status to New when sending
    serviceData.value.status = 'New';
    await updateService(editingId.value, serviceData.value);
    resetForm();
    await fetchAllServices();
  }
}

// Delete service record
async function handleDeleteService(id: string) {
  await deleteService(id);
  await fetchAllServices();
}

// Edit service handler
async function editService(srv: any) {
  isEditing.value = true;
  editingId.value = srv.id;
  await fetchServiceById(srv.id);
  serviceData.value = { ...srv }; // Populate form with the service data
}

// Cancel edit mode
function cancelEdit() {
  if (editingId.value) {
    // Change status to Canceled when canceling
    serviceData.value.status = 'Canceled';
    updateService(editingId.value, serviceData.value);
  }
  resetForm();
}

// Reset form fields and cancel edit mode
function resetForm() {
  serviceData.value = {
    service_type_id: '',
    status: 'Draft', // Reset status to Draft
    customer_id: '',
    service_date: '',
    description: '',
  };
  isEditing.value = false;
  editingId.value = null;
}
</script>
