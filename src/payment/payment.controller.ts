import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';


@Controller('payments')
export class PaymentController {

constructor(
 private service: PaymentService
){}


@Post()
create(
 @Body() body:any
){
 return this.service.create(body);
}



@Get()
findAll(){
 return this.service.findAll();
}



@Get(':ledgerId')
findByLedger(
 @Param('ledgerId') ledgerId:string
){
 return this.service.findByLedger(ledgerId);
}

}