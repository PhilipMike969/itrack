import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendTrackingEmailParams {
  userEmail: string;
  userName: string;
  trackingId: string;
  packageName: string;
  startLocation: string;
  endLocation: string;
  priceUsd?: string | number;
}

export async function sendTrackingCreatedEmail({
  userEmail,
  userName,
  trackingId,
  packageName,
  startLocation,
  endLocation,
  priceUsd,
}: SendTrackingEmailParams) {
  // Get the base URL from environment or construct it
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/track/${trackingId}`;

  const emailOptions = {
    from: 'iTrackNow Shipping <noreply@itracknow.online>',
    to: userEmail,
    subject: `📦 Your Package Tracking is Ready - ${trackingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Tracking Information</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        📦 iTrack
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                        Your Package is Being Tracked
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                        Hello ${userName}! 👋
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Great news! Your package has been registered in our tracking system and is ready to begin its journey.
                      </p>

                      <!-- Package Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 6px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #ea580c; font-size: 18px;">
                              Package Details
                            </h3>
                            
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #666666; font-size: 14px; width: 40%;">
                                  <strong>Tracking ID:</strong>
                                </td>
                                <td style="color: #333333; font-size: 14px;">
                                  <strong>${trackingId}</strong>
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">
                                  <strong>Package Name:</strong>
                                </td>
                                <td style="color: #333333; font-size: 14px;">
                                  ${packageName}
                                </td>
                              </tr>
                              ${priceUsd ? `
                              <tr>
                                <td style="color: #666666; font-size: 14px;">
                                  <strong>Value:</strong>
                                </td>
                                <td style="color: #333333; font-size: 14px;">
                                  <strong style="color: #ea580c;">$${Number(priceUsd).toFixed(2)} USD</strong>
                                </td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="color: #666666; font-size: 14px;">
                                  <strong>From:</strong>
                                </td>
                                <td style="color: #333333; font-size: 14px;">
                                  ${startLocation}
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">
                                  <strong>To:</strong>
                                </td>
                                <td style="color: #333333; font-size: 14px;">
                                  ${endLocation}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.3);">
                              Track Your Package Now
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        Or copy this link to your browser:<br>
                        <a href="${trackingUrl}" style="color: #ea580c; word-break: break-all;">${trackingUrl}</a>
                      </p>

                      <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        You can use this link anytime to check the real-time status and location of your package.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                        Thank you for using iTrack!
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} iTrack. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    const { data, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
    
    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendTrackingPriceUpdatedEmail({
  userEmail,
  userName,
  trackingId,
  packageName,
  priceUsd,
}: {
  userEmail: string;
  userName: string;
  trackingId: string;
  packageName: string;
  priceUsd: number | string | null;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/track/${trackingId}`;
  
  const formattedPrice = priceUsd ? `$${Number(priceUsd).toFixed(2)} USD` : 'N/A';

  const emailOptions = {
    from: 'iTrackNow Shipping <noreply@itracknow.online>',
    to: userEmail,
    subject: `💰 Price Update for Package ${trackingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Shipping Fee Updated</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                        Package Update
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">
                        Hello ${userName},
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        The value (price) details for your package <strong>${packageName}</strong> have been updated.
                      </p>

                      <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; color: #666666; font-size: 14px;">Updated Value:</p>
                        <p style="margin: 10px 0 0 0; color: #ea580c; font-size: 24px; font-weight: bold;">
                          ${formattedPrice}
                        </p>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              View Package
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} iTrack. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    const { data, error } = await resend.emails.send(emailOptions);
    if (error) {
      console.error('Error sending price update email:', error);
      return { success: false, error };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending price update email:', error);
    return { success: false, error };
  }
}

export async function sendTrackingLocationUpdatedEmail({
  userEmail,
  userName,
  trackingId,
  packageName,
  newLocation,
  status,
  message,
}: {
  userEmail: string;
  userName: string;
  trackingId: string;
  packageName: string;
  newLocation: string;
  status: string;
  message?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/track/${trackingId}`;
  
  const statusColor = 
    status === 'completed' ? '#16a34a' : // green
    status === 'cancelled' ? '#dc2626' : // red
    '#ea580c'; // orange

  const emailOptions = {
    from: 'iTrackNow Shipping <noreply@itracknow.online>',
    to: userEmail,
    subject: `📍 Location Update: ${packageName} is at ${newLocation}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Package Location Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${status === 'completed' ? '#16a34a, #22c55e' : '#ea580c, #f97316'}); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                        Package Update
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                        ${trackingId}
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">
                        Hello ${userName},
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Your package <strong>${packageName}</strong> has moved!
                      </p>

                      <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                        <div style="margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Current Location</span>
                        </div>
                        <div style="font-size: 18px; color: #334155; font-weight: 700;">
                            📍 ${newLocation}
                        </div>
                        ${message ? `
                        <div style="margin-top: 10px; font-size: 14px; color: #64748b;">
                            ${message}
                        </div>
                        ` : ''}
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${status === 'completed' ? '#16a34a, #22c55e' : '#ea580c, #f97316'}); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              Track Package
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} iTrack. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    const { data, error } = await resend.emails.send(emailOptions);
    if (error) {
      console.error('Error sending location update email:', error);
      return { success: false, error };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending location update email:', error);
    return { success: false, error };
  }
}
