# EmailJS Setup Guide for VHM Scholarship Registration

This guide will help you set up EmailJS to send registration confirmations automatically.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create an Email Service

1. Log in to your EmailJS dashboard
2. Go to **Email Services** (left sidebar)
3. Click **Create New Service**
4. Choose your email provider (Gmail, Outlook, etc.)
5. Follow the prompts to connect your email account
6. Copy your **Service ID** (looks like: `service_xxxxxxxxxx`)

## Step 3: Create an Email Template

1. In your EmailJS dashboard, go to **Email Templates**
2. Click **Create New Template**
3. Set the template name: `vhm_registration_confirmation`
4. Configure the template with these variables:

### Template Content (Example):

**To Email:** `{{to_email}}`

**Subject:** VHM Scholarship Registration Confirmation - {{candidate_name}}

**Body HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #0a1a2e; color: white; padding: 20px; text-align: center; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #0a1a2e; margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Registration Confirmation</h1>
    <p>Victory Holyghost Mission Scholarship Scheme</p>
  </div>

  <div style="padding: 20px;">
    <p>Dear {{candidate_name}},</p>
    
    <p>Thank you for registering for the VHM Scholarship Scheme - Season 8!</p>

    <div class="section">
      <h3>Registration Details</h3>
      <table>
        <tr>
          <td class="label">Full Name:</td>
          <td>{{first_name}} {{middle_name}} {{last_name}}</td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td>{{parent_email}}</td>
        </tr>
        <tr>
          <td class="label">Phone:</td>
          <td>{{parent_phone}}</td>
        </tr>
        <tr>
          <td class="label">School:</td>
          <td>{{school_name}}</td>
        </tr>
        <tr>
          <td class="label">Current Class:</td>
          <td>{{current_class}}</td>
        </tr>
        <tr>
          <td class="label">Registration Date:</td>
          <td>{{reg_date}}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Wait for contact from our office</li>
        <li>Provide any additional required documents</li>
        <li>Participate in the scholarship exam</li>
      </ol>
    </div>

    <div class="section">
      <p>If you have any questions, contact us at:</p>
      <p>
        <strong>Victory Holyghost Mission</strong><br>
        15/17 Abimbola Street, Isolo, Lagos, Nigeria<br>
        Phone: (+234) 08161888886, 08186516869<br>
        Email: vhmscholar@gmail.com
      </p>
    </div>

    <p>Best regards,<br><strong>VHM Scholarship Team</strong></p>
  </div>
</body>
</html>
```

4. Save the template and copy your **Template ID** (looks like: `template_xxxxxxxxxx`)

## Step 4: Get Your Public Key

1. Go to **Account** settings in EmailJS
2. Go to **API Keys** tab
3. Copy your **Public Key** (looks like: `xxxxxxxxxxxxxxxxxx`)

## Step 5: Update the JavaScript Code

Open `VHM_form.js` and replace these values:

```javascript
// Line 5: Replace with your actual Public Key
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');

// Line 57: Replace with your actual Service ID
emailjs.send(
  'YOUR_SERVICE_ID',  // Your EmailJS Service ID
  'YOUR_TEMPLATE_ID', // Your EmailJS Template ID
  templateParams
);
```

### Updated code should look like:
```javascript
// Initialize EmailJS with your Public Key
emailjs.init('pk_live_xxxxxxxxxxxxxxxxxxxxxx');

// ... later in the code ...
emailjs.send(
  'service_xxxxxxxxxx',    // Your Service ID
  'template_xxxxxxxxxxxxxx', // Your Template ID
  templateParams
);
```

## Step 6: Test the Setup

1. Open your registration form
2. Fill in all required fields
3. Click Submit
4. Check that:
   - The form redirects to success.html
   - You receive a confirmation email at the provided email address
   - Check spam folder if not in inbox

## Troubleshooting

### Email not sending?
- Check that your EmailJS service is active
- Verify all IDs are correctly copied
- Check EmailJS dashboard for error logs
- Ensure the email provider connection is authorized

### Wrong template variables?
- Template variables are case-sensitive
- Use the exact variable names from the code
- Make sure template is published

### Still having issues?
- Check browser console (F12) for error messages
- Review EmailJS documentation: https://www.emailjs.com/docs/
- Check that form fields match the JavaScript code

## Security Notes

⚠️ **Important:**
- Keep your Public Key safe (it's meant to be public)
- Never share your Service ID or Template ID publicly
- For production, consider server-side email handling
- EmailJS free tier has usage limits

## Environment Variables (Optional - For Advanced Users)

You can store credentials in environment variables:

1. Create a `.env` file (not included in git)
2. Add your keys:
```
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
```

3. Load in your JavaScript (requires build tool):
```javascript
emailjs.init(process.env.EMAILJS_PUBLIC_KEY);
```

---

For more help, visit: https://www.emailjs.com/docs/
