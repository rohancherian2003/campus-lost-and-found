const months = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

/**
 * Safely parses legacy date string formats into native JS Date objects.
 */
function parseLegacyDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  dateStr = dateStr.trim();
  
  // 1. Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "T00:00:00Z");
  }

  // 2. Format: YYYY-MM-DDTHH:mm:ssZ (Already ISO, return parsed)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }
  
  // 3. Format: dd MMM yyyy, hh:mm a / dd MMM yyyy
  const parts = dateStr.split(/[\s,]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    if (month === undefined || isNaN(day) || isNaN(year)) return null;
    
    let hours = 0;
    let minutes = 0;
    if (parts.length >= 5) {
      const timeParts = parts[3].split(':');
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      const ampm = parts[4].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
    
    return new Date(Date.UTC(year, month, day, hours, minutes, 0));
  }
  
  const nativeParse = Date.parse(dateStr);
  return isNaN(nativeParse) ? null : new Date(nativeParse);
}

// lost_items migration
print("Migrating lost_items...");
db.lost_items.find().forEach(function(item) {
  var updateFields = {};
  if (item.dateFound && typeof item.dateFound === 'string') {
    var parsed = parseLegacyDate(item.dateFound);
    if (parsed) updateFields.dateFound = parsed;
  }
  if (item.reportedAt && typeof item.reportedAt === 'string') {
    var parsed = parseLegacyDate(item.reportedAt);
    if (parsed) updateFields.reportedAt = parsed;
  }
  if (item.lastUpdated && typeof item.lastUpdated === 'string') {
    var parsed = parseLegacyDate(item.lastUpdated);
    if (parsed) updateFields.lastUpdated = parsed;
  }
  if (item.deletedAt && typeof item.deletedAt === 'string') {
    var parsed = parseLegacyDate(item.deletedAt);
    if (parsed) updateFields.deletedAt = parsed;
  }
  if (item.returnedTo) {
    var returnedTo = Object.assign({}, item.returnedTo);
    if (returnedTo.claimedDate && typeof returnedTo.claimedDate === 'string') {
      var parsed = parseLegacyDate(returnedTo.claimedDate);
      if (parsed) returnedTo.claimedDate = parsed;
    }
    updateFields.returnedTo = returnedTo;
  }
  if (Object.keys(updateFields).length > 0) {
    db.lost_items.updateOne({ _id: item._id }, { $set: updateFields });
  }
});
print("lost_items migration finished.");

// found_items migration
print("Migrating found_items...");
db.found_items.find().forEach(function(item) {
  var updateFields = {};
  if (item.dateFound && typeof item.dateFound === 'string') {
    var parsed = parseLegacyDate(item.dateFound);
    if (parsed) updateFields.dateFound = parsed;
  }
  if (item.foundAt && typeof item.foundAt === 'string') {
    var parsed = parseLegacyDate(item.foundAt);
    if (parsed) updateFields.foundAt = parsed;
  }
  if (item.lastUpdated && typeof item.lastUpdated === 'string') {
    var parsed = parseLegacyDate(item.lastUpdated);
    if (parsed) updateFields.lastUpdated = parsed;
  }
  if (item.deletedAt && typeof item.deletedAt === 'string') {
    var parsed = parseLegacyDate(item.deletedAt);
    if (parsed) updateFields.deletedAt = parsed;
  }
  if (item.returnedTo) {
    var returnedTo = Object.assign({}, item.returnedTo);
    if (returnedTo.returnedDate && typeof returnedTo.returnedDate === 'string') {
      var dateStr = returnedTo.returnedDate;
      if (returnedTo.returnedTime && returnedTo.returnedTime.trim()) {
        dateStr += "T" + returnedTo.returnedTime.trim() + ":00Z";
      }
      var parsed = parseLegacyDate(dateStr);
      if (parsed) returnedTo.returnedDate = parsed;
    }
    updateFields.returnedTo = returnedTo;
  }
  if (Object.keys(updateFields).length > 0) {
    db.found_items.updateOne({ _id: item._id }, { $set: updateFields });
  }
});
print("found_items migration finished.");

// disposed_items migration
print("Migrating disposed_items...");
db.disposed_items.find().forEach(function(item) {
  var updateFields = {};
  if (item.reportedDate && typeof item.reportedDate === 'string') {
    var parsed = parseLegacyDate(item.reportedDate);
    if (parsed) updateFields.reportedDate = parsed;
  }
  if (item.disposedDate && typeof item.disposedDate === 'string') {
    var parsed = parseLegacyDate(item.disposedDate);
    if (parsed) updateFields.disposedDate = parsed;
  }
  if (item.createdAt && typeof item.createdAt === 'string') {
    var parsed = parseLegacyDate(item.createdAt);
    if (parsed) updateFields.createdAt = parsed;
  }
  if (Object.keys(updateFields).length > 0) {
    db.disposed_items.updateOne({ _id: item._id }, { $set: updateFields });
  }
});
print("disposed_items migration finished.");

print("MongoDB Date Standardization Migration Completed Successfully.");
