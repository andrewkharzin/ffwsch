export const useFfmTelex = () => {
  const supabase = useSupabaseClient()

  // Fetch AWB records from the ffm_telex table
  const fetchFfmTelexRecords = async () => {
    const { data, error } = await supabase
      .from('ffm_telex')
      .select('id, awb_carrier, awb_number, number_pcs, weight, volume')
    if (error) throw error
    return data
  }

  // Save shipment data
  const saveShipment = async shipment => {
    const { error } = await supabase.from('shipments').insert(shipment)
    if (error) throw error
  }

  return { fetchFfmTelexRecords, saveShipment }
}
