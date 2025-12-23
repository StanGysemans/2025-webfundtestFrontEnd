// Geocoding service using OpenStreetMap Nominatim API (free, no API key required)
export const geocodingService = {
  async geocodeAddress(address, city, postalCode) {
    try {
      // Clean and validate inputs
      const cleanAddress = address?.trim() || ''
      const cleanCity = city?.trim() || ''
      const cleanPostalCode = postalCode?.trim() || ''
      
      // Need at least address and city
      if (!cleanAddress || !cleanCity) {
        return null
      }
      
      // Build address string in optimal format for Belgian addresses
      // Format: "Street, PostalCode City, België"
      let fullAddress = cleanAddress
      
      // Add postal code and city together (Dutch format: "1234AB Amsterdam")
      if (cleanPostalCode && cleanCity) {
        fullAddress += `, ${cleanPostalCode} ${cleanCity}`
      } else if (cleanCity) {
        fullAddress += `, ${cleanCity}`
      } else if (cleanPostalCode) {
        fullAddress += `, ${cleanPostalCode}`
      }
      
      // Add country
      fullAddress += ', België'
      
      console.log('Geocoding address:', fullAddress)
      
      // Use Nominatim API with better parameters for Belgian addresses
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=be&addressdetails=1&accept-language=nl`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'UitgaansFinder/1.0', // Required by Nominatim
          'Accept-Language': 'nl-NL,nl;q=0.9'
        }
      })
      
      if (!response.ok) {
        console.error('Geocoding response not OK:', response.status, response.statusText)
        throw new Error(`Geocoding request failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Geocoding response:', data)
      
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        
        // Validate coordinates (Belgium bounds approximately)
        if (lat >= 49.5 && lat <= 51.5 && lng >= 2.5 && lng <= 6.4) {
          return { lat, lng }
        } else {
          console.warn('Coordinates outside Belgium bounds:', { lat, lng })
          // Still return them, but log warning
          return { lat, lng }
        }
      }
      
      // Try alternative format if first attempt failed
      if (cleanPostalCode && cleanCity) {
        const altAddress = `${cleanPostalCode} ${cleanCity}, België`
        console.log('Trying alternative format:', altAddress)
        
        const altUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(altAddress)}&limit=1&countrycodes=be&addressdetails=1`
        
        const altResponse = await fetch(altUrl, {
          headers: {
            'User-Agent': 'UitgaansFinder/1.0',
            'Accept-Language': 'nl-NL,nl;q=0.9'
          }
        })
        
        if (altResponse.ok) {
          const altData = await altResponse.json()
          if (altData && altData.length > 0 && altData[0].lat && altData[0].lon) {
            return {
              lat: parseFloat(altData[0].lat),
              lng: parseFloat(altData[0].lon)
            }
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }
}

