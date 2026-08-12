const { Readable } = require('stream');

/**
 * Demonstrates Node.js Streams: converts an array of booking records into
 * a CSV stream piped directly to the HTTP response instead of building
 * the whole string in memory first.
 */
function streamBookingsAsCsv(res, bookings) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="my-bookings.csv"');

  const header = 'Listing,Role,Status,StartDate,EndDate,CreatedAt\n';

  const source = new Readable({
    read() {},
  });

  source.pipe(res);
  source.push(header);

  for (const b of bookings) {
    const row = [
      `"${(b.listingTitle || '').replace(/"/g, '""')}"`,
      b.role,
      b.status,
      b.startDate ? new Date(b.startDate).toISOString().slice(0, 10) : '',
      b.endDate ? new Date(b.endDate).toISOString().slice(0, 10) : '',
      new Date(b.createdAt).toISOString(),
    ].join(',');
    source.push(row + '\n');
  }

  source.push(null); // end stream
}

module.exports = { streamBookingsAsCsv };
