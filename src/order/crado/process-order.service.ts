import { Order } from '../domain/entity/order.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import { SendMailService } from './send-mail.service';
import { ClientMessageService } from './client-message.service';

export default class ProcessOrderService {
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
    if (!order.isValid()) {
      throw new Error('Order validation failed');
    }

    const sendMailService = new SendMailService();
    await sendMailService.sendMail(order);

    const clientMessageService = new ClientMessageService();
    await clientMessageService.sendClientMessage(order);

    await this.orderRepository.save(order);
  }

}