const Sib = require('sib-api-v3-sdk')

export const sendMailRegistration = async (to: string) => {
  const subject = 
  `
    Your account on OrangeFund.us is ready!
  `;
  const textContent = 
  `
    You can now support your favorite fund with native BTC at ${process.env.NEXT_PUBLIC_BASE_URL}
  `;
  const htmlContent =
  `
    You can now support your favorite fund with native BTC at
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}"> OrangeFund.us</a>
  `;

  sendMail(to, subject, textContent, htmlContent);
}

export const sendMail = async (to: string, subject: string, textContent: string, htmlContent: string) => {
  const client = Sib.ApiClient.instance
  var apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.SIB_API_KEY;

  const emailApi = new Sib.TransactionalEmailsApi()
  const sender = {
    email: 'support@orangefund.us',
    name: 'OrangeFund.us',
  }
  const receivers = [{ email: to }]

  emailApi.sendTransacEmail({
    sender: sender,
    to: receivers,
    subject: subject,
    textContent: textContent,
    htmlContent: htmlContent
  })
  .then(console.log)
  .catch(console.log)
}
