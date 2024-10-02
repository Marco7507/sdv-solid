import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import { Order } from 'src/order/domain/entity/order.entity';

@Injectable()
export class OrderManagerService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async processOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const isValid = order.isValid();
    if (!isValid) {
      throw new Error('Order validation failed');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: order.customerEmail,
      subject: 'Confirmation de commande',
      text: `Votre commande numéro ${order.id} a été confirmée.`,
    };

    await transporter.sendMail(mailOptions);

    const accountSid = 'your_twilio_account_sid';
    const authToken = 'your_twilio_auth_token';
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: `Votre commande numéro ${order.id} a été confirmée.`,
      from: '+1234567890',
      to: order.customerPhoneNumber,
    });

    await this.orderRepository.save(order);
  }
}
