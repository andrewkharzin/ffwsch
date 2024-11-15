// composables/useFfmMessage.ts

export function useFfmMessage() {
  const supabase = useSupabaseClient()

  // Function to generate FFM/5 message with airport IATA codes for a given FFM ID
  const generateFfm5Message = async (ffmId: string) => {
    // Fetch main FFM data, including airport IATA codes and related ffm_telex entries
    const { data: ffmData, error: ffmError } = await supabase
      .from('ffm')
      .select(`
        flight,
        date,
        airport_from:airport_from ( iata ),
        airport_to:airport_to ( iata ),
        ffm_telexes:ffm_telex (
          awb_carrier,
          awb_number,
          number_pcs,
          weight,
          volume,
          shipping_name,
          shc
        )
      `)
      .eq('id', ffmId)
      .single()

    if (ffmError) {
      console.error('Error fetching FFM data:', ffmError)
      return ''
    }

    if (!ffmData) {
      console.log('No FFM record found for this ID')
      return ''
    }

    // Destructure FFM main data
    const {
      flight,
      date,
      airport_from,
      airport_to,
      ffm_telexes
    } = ffmData

    // Format date (e.g., "14NOV")
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    }).toUpperCase()

    // Extract IATA codes, fallback to 'N/A' if not available
    const fromIata = airport_from?.iata || 'N/A'
    const toIata = airport_to?.iata || 'N/A'

    // Line 1: FFM/5 message header
    const line1 = `FFM/5\n1/${flight}/${formattedDate}/${fromIata}`

    // Line 2: Arrival airport
    const line2 = `${toIata}`

    // Line 3 and onwards: AWB and shipment details for each ffm_telex record
    const line3AndBeyond = ffm_telexes.map(telex => {
      const {
        awb_carrier,
        awb_number,
        number_pcs,
        weight,
        volume,
        shipping_name,
        shc
      } = telex

      return `${awb_carrier}-${awb_number}${fromIata}${toIata}`
        + `/S${number_pcs}K${weight}${volume ? `M${volume}` : ''}`
        + `${shc ? `${shc}` : ''}`
        + (shipping_name ? `/${shipping_name.toUpperCase()}` : '')
    }).join('\n')

    // Combine all parts of the message
    const ffm5Message = `${line1}\n${line2}\n${line3AndBeyond}`
    return ffm5Message
  }

  return {
    generateFfm5Message
  }
}
