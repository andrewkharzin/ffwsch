// utils/date/date.ts
export function formatDate(dateString: string): string {
  // Create a Date object from the input string
  const date = new Date(dateString)

  // Get the individual date components
  const day = String(date.getDate()).padStart(2, '0') // Day with leading zero
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month (0-indexed)
  const year = String(date.getFullYear()).slice(-2) // Last two digits of the year
  const hours = String(date.getHours()).padStart(2, '0') // Hours with leading zero
  const minutes = String(date.getMinutes()).padStart(2, '0') // Minutes with leading zero

  // Format the date as dd/mm/yy hh:mm
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
