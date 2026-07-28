import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports:[
    MailerModule.forRoot({
      transport:{
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
          user:process.env.EMAIL_USER,
          pass:process.env.EMAIL_PASS,
        }
      }
    })
  ],
  exports:[
    MailerModule
  ]
})
export class MailModule {}