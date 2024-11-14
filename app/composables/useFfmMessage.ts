// composables/useFfmMessage.ts

export function useFfmMessage() {
  const supabase = useSupabaseClient()

  // Function to generate FFM/8 message for a given FFM ID
  const generateFfm8Message = async (ffmId: string) => {
    // Fetch `ffm_telex` records related to the specified `ffm_id`
    const { data, error } = await supabase
      .from('ffm_telex')
      .select(`
        airport_from_id,
        airport_to_id,
        awb_carrier,
        awb_number,
        number_pcs,
        weight,
        volume,
        shipping_name,
        shc,
        flight,
        date
      `)
      .eq('ffm_id', ffmId)

    if (error) {
      console.error('Error fetching FFM Telex data:', error)
      return ''
    }

    // Check if any data was found
    if (!data || data.length === 0) {
      console.log('No FFM Telex records found for this FFM ID')
      return ''
    }

    // Format the data into FFM/8 message structure
    const ffm8Message = data.map(telex => {
      const {
        airport_from_id,
        airport_to_id,
        awb_carrier,
        awb_number,
        number_pcs,
        weight,
        volume,
        shipping_name,
        shc,
        flight,
        date
      } = telex

      // Example format for FFM/8 message line
      return `/FLIGHT ${flight} ${date} ${airport_from_id}${airport_to_id}
      /AWB ${awb_carrier}-${awb_number}/${number_pcs}/P${number_pcs}/K${weight}${volume ? `/V${volume}` : ''}${shipping_name ? `/N${shipping_name}` : ''}${shc ? `/S${shc}` : ''}`
    }).join('\n')

    // Return the generated FFM/8 message
    return `FFM/8\n${ffm8Message}`
  }

  return {
    generateFfm8Message
  }
}
