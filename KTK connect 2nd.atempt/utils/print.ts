import { Booking, BlockedSlot, Group, User } from '../types';

const generatePrintableHTML = (
    bookings: Booking[], 
    blockedSlots: BlockedSlot[],
    groups: Group[],
    users: User[],
    startDate: Date,
    endDate: Date
    ): string => {

    let content = ``;
    const tempDate = new Date(startDate);

    while(tempDate <= endDate) {
        const dayBookings = bookings.filter(b => new Date(b.startTime).toDateString() === tempDate.toDateString());
        const dayBlocked = blockedSlots.filter(s => new Date(s.startTime).toDateString() === tempDate.toDateString());
        
        const allEvents = [...dayBookings, ...dayBlocked].sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        if (allEvents.length > 0) {
            content += `<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-2">${tempDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>`;
            content += `<table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-2 border text-left text-sm">Time</th>
                        <th class="p-2 border text-left text-sm">Court</th>
                        <th class="p-2 border text-left text-sm">Details</th>
                        <th class="p-2 border text-left text-sm">Type</th>
                    </tr>
                </thead>
                <tbody>`;
            
            allEvents.forEach(event => {
                const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                const time = `${startTime} - ${endTime}`;
                
                let details = '';
                let type = '';
                let notes = '';
                
                if ('reason' in event) { // It's a BlockedSlot
                    details = event.reason;
                    type = 'Blocked';
                } else { // It's a Booking
                    const group = groups.find(g => g.id === event.groupId);
                    details = group ? group.name : 'Group session';
                    type = 'Group Training';
                    if (event.notes) {
                        notes = event.notes;
                    }
                }

                content += `
                    <tr>
                        <td class="p-2 border">${time}</td>
                        <td class="p-2 border">Court ${event.courtId}</td>
                        <td class="p-2 border">${details}</td>
                        <td class="p-2 border">${type}</td>
                    </tr>
                `;

                if (notes) {
                    content += `
                        <tr>
                            <td colspan="4" class="p-2 border text-xs text-gray-700 bg-gray-50">
                                <strong>Notes:</strong> ${notes.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600">$1</a>')}
                            </td>
                        </tr>
                    `
                }
            });

            content += `</tbody></table>`;
        }

        tempDate.setDate(tempDate.getDate() + 1);
    }
    

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>KTK Connect Schedule</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                }
            </style>
        </head>
        <body class="p-8 font-sans">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold">KTK Connect Schedule</h1>
                <p class="text-sm text-gray-500">Generated on: ${new Date().toLocaleString()}</p>
            </div>
            ${content || '<p class="text-gray-500">No events to display for the selected period.</p>'}
            <button onclick="window.print()" class="no-print fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg">Print</button>
        </body>
        </html>
    `;
};


export const printSchedule = (
    bookings: Booking[], 
    blockedSlots: BlockedSlot[],
    groups: Group[],
    users: User[],
    startDate: Date,
    endDate: Date
) => {
  const printableHTML = generatePrintableHTML(bookings, blockedSlots, groups, users, startDate, endDate);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printableHTML);
    printWindow.document.close();
  }
};