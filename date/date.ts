// utils/date/date.ts
export function formatDate(dateString: string): string {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Options for the desired formatting
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short', // This gives us the GMT+X part
    hour12: true, // Use 12-hour format
  };

  // Format the date to the desired format
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  return formattedDate;
}
