const Sib = require('sib-api-v3-sdk')

export async function sendMailRegistration(to: string): Promise<boolean> {
  const subject = 
  `
    Your OrangeFund account is ready!
  `;
  const textContent = 
  `
    Hi!
    Your account is all ready! Just go to OrangeFund.us to get started. If you have any questions reply back to this email. We're happy to help.  
    Best,
    Philip 
  `;
  const htmlContent =
  `
    <p>Hi!</p>
    <p>Your account is all ready! Just go to <a href="${process.env.NEXT_PUBLIC_BASE_URL}"> OrangeFund.us</a> to get started.</p>
    <p>If you have any questions reply back to this email. We're happy to help.</p>
    <p>Best,</p>
    <p>Philip</p> 
  `;

  return await sendMail(to, subject, textContent, htmlContent);
}

export async function sendMail(to: string, subject: string, textContent: string, htmlContent: string): Promise<boolean> {
  const client = Sib.ApiClient.instance
  var apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.SIB_API_KEY;

  const emailApi = new Sib.TransactionalEmailsApi()
  const sender = {
    email: 'support@orangefund.us',
    name: 'OrangeFund.us',
  }
  const receivers = [{ email: to }]

  const sendResult = await emailApi.sendTransacEmail({
    sender: sender,
    to: receivers,
    subject: subject,
    textContent: textContent,
    htmlContent: htmlContent
  });
  return true;
}
