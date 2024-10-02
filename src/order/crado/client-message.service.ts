export class ClientMessageService {
  async sendClientMessage(order) {
    const accountSid = 'your_twilio_account_sid';
    const authToken = 'your_twilio_auth_token';
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: `Votre commande numéro ${order.id} a été confirmée.`,
      from: '+1234567890',
      to: order.customerPhoneNumber,
    });
  }
}