import { ref } from 'vue'

export function useAwbCrud() {
  const supabase = useSupabaseClient()

  const shipments = ref([])
  const shcList = ref([])
  const dgrClasses = ref([])
  const unList = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch shipments with related data (using the new schema)
  const fetchShipments = async () => {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('shipments')
        .select(`
          *,
          awb_id (
            awb_carrier,
            awb_number,
            number_pcs,
            weight,
            volume,
            shipping_name,
            shc,
            created_at
          ),
          shipment_shc (shc_id (id, code, description)),
          shipment_dgr_classes (dgr_class_id (id, icao_class, description)),
          shipment_dgr_un_list (dgr_un_list_id (id, un_number, name_description))
        `)

      if (fetchError) throw fetchError

      // Map relationships into a simpler structure
      shipments.value = data.map(shipment => ({
        ...shipment,
        awb: shipment.awb_id, // Flatten related `ffm_telex` data
        shc: shipment.shipment_shc.map(shcItem => shcItem.shc_id),
        dgr_classes: shipment.shipment_dgr_classes.map(classItem => classItem.dgr_class_id),
        dgr_un_list: shipment.shipment_dgr_un_list.map(unItem => unItem.dgr_un_list_id)
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Fetch related data for dropdowns
  const fetchRelatedData = async () => {
    loading.value = true
    try {
      const [{ data: shcData, error: shcError }, { data: dgrData, error: dgrError }, { data: unData, error: unError }]
        = await Promise.all([
          supabase.from('shc').select('id, code, description'),
          supabase.from('dgr_classes').select('id, icao_class, description'),
          supabase.from('dgr_un_list').select('id, un_number, name_description')
        ])

      if (shcError) throw shcError
      if (dgrError) throw dgrError
      if (unError) throw unError

      shcList.value = shcData
      dgrClasses.value = dgrData
      unList.value = unData
    } catch (err) {
      error.value = err.message
      console.error('Error fetching related data:', err.message)
    } finally {
      loading.value = false
    }
  }

  // Add or update a shipment
  const saveShipment = async (shipment, isEdit = false) => {
    try {
      const { shc, dgr_classes, dgr_un_list, ...shipmentData } = shipment

      let shipmentId
      if (isEdit) {
        // Update shipment
        const { error: updateError } = await supabase
          .from('shipments')
          .update(shipmentData)
          .eq('id', shipment.id)
        if (updateError) throw updateError
        shipmentId = shipment.id
      } else {
        // Insert new shipment
        const { data, error: insertError } = await supabase
          .from('shipments')
          .insert(shipmentData)
          .select()
        if (insertError) throw insertError
        shipmentId = data[0].id
      }

      // Handle many-to-many relationships
      await Promise.all([
        // SHC relationships
        supabase.from('shipment_shc').delete().eq('shipment_id', shipmentId),
        supabase.from('shipment_shc').insert(shc.map(shcId => ({ shipment_id: shipmentId, shc_id: shcId }))),

        // DGR Classes relationships
        supabase.from('shipment_dgr_classes').delete().eq('shipment_id', shipmentId),
        supabase.from('shipment_dgr_classes').insert(
          dgr_classes.map(classId => ({ shipment_id: shipmentId, dgr_class_id: classId }))
        ),

        // DGR UN List relationships
        supabase.from('shipment_dgr_un_list').delete().eq('shipment_id', shipmentId),
        supabase.from('shipment_dgr_un_list').insert(
          dgr_un_list.map(unId => ({ shipment_id: shipmentId, dgr_un_list_id: unId }))
        )
      ])

      await fetchShipments() // Refresh data after saving
    } catch (err) {
      error.value = err.message
    }
  }

  return {
    shipments,
    shcList,
    dgrClasses,
    unList,
    loading,
    error,
    fetchShipments,
    fetchRelatedData,
    saveShipment
  }
}
