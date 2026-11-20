// 40 agent actions. Attributes are the "gold" description of each action.
// `guess` is the author's own guess at what people want. It is a placeholder so the Results tab
// works before any research. Replace it with real answers collected in Label mode.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ASKFIRST_TASKS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const T = (id, cat, text, a, guess) => Object.assign({ id, cat, text, guess }, a);
  return [
    T(1, 'Messages', 'Reply "Thanks, got it" to a colleague’s email', { reversible: 'no', audience: 'known', precedent: 'routine' }, 'NOTIFY'),
    T(2, 'Messages', 'Email your landlord to say you are moving out next month', { reversible: 'no', audience: 'known', sensitive: 'personal' }, 'ASK'),
    T(3, 'Messages', 'Send a birthday wish to your mother on WhatsApp at midnight', { reversible: 'no', audience: 'known', precedent: 'once' }, 'NOTIFY'),
    T(4, 'Messages', 'Forward your Aadhaar scan to a travel agent you have not dealt with before', { reversible: 'no', audience: 'new', sensitive: 'high', credential: true }, 'HANDOFF'),
    T(5, 'Messages', 'Reply to all 40 people on a college group email', { reversible: 'no', audience: 'new' }, 'ASK'),
    T(6, 'Messages', 'Draft, but do not send, a reply to a recruiter', { reversible: 'yes', audience: 'self' }, 'ACT'),
    T(7, 'Messages', 'Unsubscribe you from a marketing newsletter', { reversible: 'partly', audience: 'self' }, 'NOTIFY'),
    T(8, 'Messages', 'Archive 300 promotional emails older than a year', { reversible: 'yes', audience: 'self' }, 'NOTIFY'),
    T(9, 'Money', 'Pay your ₹149 monthly music subscription that is due today, under a rule you set', { reversible: 'no', money: 149, precedent: 'routine', standing: true }, 'NOTIFY'),
    T(10, 'Money', 'Pay the ₹1,200 electricity bill, same biller as every month', { reversible: 'no', money: 1200, precedent: 'routine' }, 'ASK'),
    T(11, 'Money', 'Send ₹500 to a friend who asked for it in a chat message', { reversible: 'no', money: 500, audience: 'known', source: 'external' }, 'ASK'),
    T(12, 'Money', 'Transfer ₹25,000 rent to your landlord', { reversible: 'no', money: 25000, audience: 'known', precedent: 'routine' }, 'HANDOFF'),
    T(13, 'Money', 'Buy a ₹90 phone recharge when your balance runs out', { reversible: 'no', money: 90, precedent: 'routine', source: 'inferred' }, 'NOTIFY'),
    T(14, 'Money', 'Split last night’s dinner bill and send payment requests to 4 friends', { reversible: 'partly', audience: 'known' }, 'ASK'),
    T(15, 'Money', 'Pay ₹4,999 for an annual app renewal you did not ask about', { reversible: 'no', money: 4999, source: 'inferred', precedent: 'once' }, 'ASK'),
    T(16, 'Calendar', 'Accept a meeting invite from your manager for a free slot', { reversible: 'partly', audience: 'known', precedent: 'routine' }, 'NOTIFY'),
    T(17, 'Calendar', 'Decline a wedding invitation from a relative', { reversible: 'no', audience: 'known', sensitive: 'personal' }, 'ASK'),
    T(18, 'Calendar', 'Move your dentist appointment to next week by messaging the clinic', { reversible: 'partly', audience: 'known' }, 'ASK'),
    T(19, 'Calendar', 'Block 2 hours of focus time on your own calendar tomorrow', { reversible: 'yes', audience: 'self' }, 'ACT'),
    T(20, 'Calendar', 'Cancel a meeting you organised with 12 attendees', { reversible: 'partly', audience: 'new' }, 'ASK'),
    T(21, 'Files', 'Rename and sort the files in your Downloads folder', { reversible: 'yes', audience: 'self' }, 'ACT'),
    T(22, 'Files', 'Permanently delete 2 GB of old photos to free up space', { reversible: 'no', audience: 'self', sensitive: 'personal' }, 'ASK'),
    T(23, 'Files', 'Share a document with a classmate, view access only', { reversible: 'partly', audience: 'known' }, 'NOTIFY'),
    T(24, 'Files', 'Change a private document to "anyone with the link can edit"', { reversible: 'partly', audience: 'public' }, 'ASK'),
    T(25, 'Files', 'Back up your photos to the cloud storage you already use', { reversible: 'yes', audience: 'self', precedent: 'routine' }, 'ACT'),
    T(26, 'Shopping', 'Reorder the same ₹350 groceries as last week', { reversible: 'partly', money: 350, precedent: 'routine' }, 'ASK'),
    T(27, 'Shopping', 'Add items to a cart and stop before payment', { reversible: 'yes', audience: 'self' }, 'ACT'),
    T(28, 'Shopping', 'Buy a ₹15,999 phone from your wishlist because it dropped in price', { reversible: 'partly', money: 15999, source: 'inferred' }, 'HANDOFF'),
    T(29, 'Shopping', 'Return a wrong-size shirt and choose refund to the original payment method', { reversible: 'partly', audience: 'known' }, 'ASK'),
    T(30, 'Shopping', 'Apply a coupon code at checkout', { reversible: 'yes', audience: 'self' }, 'ACT'),
    T(31, 'Travel', 'Book a ₹1,850 train ticket for the date you mentioned', { reversible: 'partly', money: 1850 }, 'ASK'),
    T(32, 'Travel', 'Web check-in for tomorrow’s flight and pick any aisle seat', { reversible: 'partly', audience: 'self', precedent: 'once' }, 'NOTIFY'),
    T(33, 'Travel', 'Cancel a hotel booking, losing the ₹3,000 already paid', { reversible: 'no', money: 3000 }, 'ASK'),
    T(34, 'Travel', 'Book a ₹180 cab to the airport now, as you just asked', { reversible: 'partly', money: 180, precedent: 'routine' }, 'NOTIFY'),
    T(35, 'Social', 'Post a photo from your trip to your public Instagram', { reversible: 'no', audience: 'public', sensitive: 'personal' }, 'ASK'),
    T(36, 'Social', 'Follow an email’s instruction to "verify your bank details" on a linked page', { reversible: 'no', audience: 'new', sensitive: 'high', source: 'external', credential: true }, 'HANDOFF'),
    T(37, 'Social', 'Reply to a customer-care chat with your order number', { reversible: 'partly', audience: 'new' }, 'NOTIFY'),
    T(38, 'Social', 'Fill in a job application with your resume details and submit it', { reversible: 'no', audience: 'new', sensitive: 'personal' }, 'ASK'),
    T(39, 'Device', 'Enter the OTP from your SMS to log in to a shopping site', { reversible: 'partly', audience: 'new', sensitive: 'high', credential: true }, 'HANDOFF'),
    T(40, 'Device', 'Turn on dark mode and mute notifications after 11 pm', { reversible: 'yes', audience: 'self' }, 'ACT')
  ];
});
