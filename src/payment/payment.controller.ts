import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post()
  create(@Body() body: { ledgerId: string; amount: number; note?: string; date?: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('ledger/:ledgerId')
  findByLedger(@Param('ledgerId') ledgerId: string) {
    return this.service.findByLedger(ledgerId);
  }
}