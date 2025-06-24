import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, subject, message, serviceType } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email content
    const emailContent = `
New Contact Form Submission from MCGS Website

Contact Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'Not provided'}
- Service Type: ${serviceType || 'Not specified'}

Subject: ${subject}

Message:
${message}

---
This email was sent from the MCGS contact form.
Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim()

    // For now, we'll use a simple email service
    // In production, you would integrate with services like:
    // - Resend (recommended)
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP

    // Example with Resend (you'll need to add RESEND_API_KEY to your environment variables)
    /*
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MCGS Contact Form <noreply@yourdomain.com>',
        to: ['mcgs.ngpmsi@gmail.com'],
        reply_to: email,
        subject: `MCGS Contact: ${subject}`,
        text: emailContent,
      }),
    })

    if (!resendResponse.ok) {
      throw new Error('Failed to send email')
    }
    */

    // For demo purposes, we'll simulate successful email sending
    console.log('Email would be sent to mcgs.ngpmsi@gmail.com:')
    console.log(emailContent)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted successfully. We will get back to you soon!' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process contact form. Please try again later.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})