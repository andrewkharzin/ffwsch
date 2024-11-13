import { ref } from 'vue'

export function useRapid() {
  const flightsData = ref<{ arrivals: any[]; departures: any[] }>({
    arrivals: [],
    departures: [],
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pageTotal = ref(0)
  const liveFlightInfo = ref(null)

  const fetchFlights = async (iataCode: string) => {
    console.log('Fetching flights for IATA code:', iataCode)
    const url = `https://api.magicapi.dev/api/v1/aedbx/aerodatabox/flights/airports/Iata/${iataCode}?offsetMinutes=-120&durationMinutes=720&direction=Both&withLeg=false&withCancelled=true&withCodeshared=true&withCargo=true&withPrivate=true&withLocation=false`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-magicapi-key': 'cm0793wkr0009jz03atsf6hld' // Replace with your actual key
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // Set a 10-second timeout

    loading.value = true
    error.value = null

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const text = await response.text()
      const result = JSON.parse(text)
      flightsData.value.arrivals = result.arrivals || []
      flightsData.value.departures = result.departures || []
      pageTotal.value = flightsData.value.arrivals.length + flightsData.value.departures.length
      console.log("FlightData Test", flightsData)
    } catch (err) {
      console.error('Error fetching flights data:', err)
      error.value = err.name === 'AbortError' ? 'Request timed out' : 'Failed to fetch flight data. Please try again later.'
    } finally {
      clearTimeout(timeoutId)
      loading.value = false
    }
  }
  // New method to fetch flight information by flight number
  const fetchFlightInfoByNumber = async (flightNumber: string) => {
    console.log('Fetching flight info for flight number:', flightNumber)

    const url = `https://flightera-flight-data.p.rapidapi.com/flight/info?flnr=${flightNumber}`

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '7d1a941f06msh29874c6d06f5f6ep12d1d0jsn2fae8bf64af4', // Replace with your actual RapidAPI key
        'x-rapidapi-host': 'flightera-flight-data.p.rapidapi.com'
      }
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.text()
      console.log('Flight info response:', result)

      // Parse and handle flight information as needed
      // Note: Handle any JSON parsing if necessary
    } catch (err) {
      console.error('Error fetching flight info:', err)
      error.value =
        'Failed to fetch flight information. Please try again later.'
    } finally {
      loading.value = false
    }
  }
  // New method to fetch live flight information by flight number
  // const fetchLiveFlightByNumber = async (flightNumber: string) => {
  //   console.log('Fetching live flight info for flight number:', flightNumber)

  //   const url = `https://flightera-flight-data.p.rapidapi.com/flight/info?flnr=${flightNumber}`
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       'x-rapidapi-key': '7d1a941f06msh29874c6d06f5f6ep12d1d0jsn2fae8bf64af4', // Replace with your actual RapidAPI key
  //       'x-rapidapi-host': 'flightera-flight-data.p.rapidapi.com'
  //     }
  //   }

  //   loading.value = true
  //   error.value = null

  //   try {
  //     const response = await fetch(url, options)
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`)
  //     }

  //     const result = await response.text()
  //     console.log('Live flight info response:', result)

  //     // Parse and handle flight information as needed
  //     // Note: Handle any JSON parsing if necessary
  //   } catch (err) {
  //     console.error('Error fetching live flight info:', err)
  //     error.value = 'Failed to fetch live flight information. Please try again later.'
  //   } finally {
  //     loading.value = false
  //   }
  // }

  return {
    flightsData,
    loading,
    error,
    pageTotal,
    fetchFlights,
    fetchFlightInfoByNumber,
    // fetchLiveFlightByNumber // Export the new method
  }
}
