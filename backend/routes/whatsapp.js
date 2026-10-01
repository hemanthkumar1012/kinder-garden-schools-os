const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Mock WhatsApp messages in Marathi / Hindi / English
const messages = {
  'admission-received': {
    Marathi: (d) => `नमस्कार ${d.name}, ${d.childName} ची admission ${d.admissionNo} प्राप्त झाली आहे. Class: ${d.className} - School.`,
    Hindi: (d) => `नमस्ते ${d.name}, ${d.childName} का admission ${d.admissionNo} प्राप्त हुआ। Class: ${d.className}`,
    English: (d) => `Hello ${d.name}, Admission ${d.admissionNo} received for ${d.childName}. Class: ${d.className}`,
  },
  'admission-confirmed': {
    Marathi: (d) => `अभिनंदन ${d.name}! ${d.childName} ची admission ${d.className} मध्ये पुष्टी झाली. Admission No: ${d.admissionNo}. UPI Fee: ${d.upiId}`,
    Hindi: (d) => `बधाई ${d.name}! ${d.childName} का admission ${d.className} में पुष्टि। No: ${d.admissionNo}. UPI: ${d.upiId}`,
    English: (d) => `Congrats ${d.name}! ${d.childName} admitted to ${d.className}. No: ${d.admissionNo}. Pay via UPI: ${d.upiId}`,
  },
  'feedback-thanks': {
    Marathi: (d) => `धन्यवाद ${d.name}! Rating ${d.rating} stars. आपल्या अभिप्रायाबद्दल आभार.`,
    Hindi: (d) => `धन्यवाद ${d.name}! Rating ${d.rating} stars.`,
    English: (d) => `Thank you ${d.name}! Rating ${d.rating} stars received.`,
  },
  'webinar-registered': {
    Marathi: (d) => `Webinar ${d.webinarTitle} ${d.eventDate} साठी register झाले. Link: ${d.meetingLink}`,
    Hindi: (d) => `Webinar ${d.webinarTitle} ${d.eventDate} के लिए register. Link: ${d.meetingLink}`,
    English: (d) => `Registered for ${d.webinarTitle} on ${d.eventDate}. Link: ${d.meetingLink}`,
  },
  'webinar-reminder': {
    Marathi: (d) => `स्मरण: Webinar ${d.webinarTitle} उद्या. Link: ${d.meetingLink}`,
    Hindi: (d) => `याद: Webinar ${d.webinarTitle} कल. Link: ${d.meetingLink}`,
    English: (d) => `Reminder: Webinar ${d.webinarTitle} tomorrow. Link: ${d.meetingLink}`,
  },
};

// POST /api/whatsapp/send
router.post('/send', auth, async (req, res) => {
  try {
    const {
      type, phone, language = 'Marathi',
      name, childName, admissionNo, className,
      webinarTitle, eventDate, meetingLink, rating, upiId,
    } = req.body;

    if (!type || !phone) {
      return res.status(400).json({ error: 'type and phone required' });
    }

    const tmpl = messages[type];
    if (!tmpl) return res.status(400).json({ error: 'Unknown message type' });

    const lang = language || 'Marathi';
    const fn = tmpl[lang] || tmpl.Marathi;
    const text = fn({
      name, childName, admissionNo, className,
      webinarTitle, eventDate, meetingLink, rating, upiId: upiId || '',
    });

    // Mock send - in production integrate with WhatsApp Business API
    console.log(`[WhatsApp MOCK] To: ${phone} | Lang: ${lang}`);
    console.log(`Message: ${text}`);

    res.json({ success: true, message: text, phone, type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
