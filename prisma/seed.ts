import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  const password = "YourPassword123";
  const hashedPassword = await bcrypt.hash(password, 10);


  await prisma.user.createMany({
    data: [
      {
        email: "owner1@gmail.com",
        firstName: "Owner",
        lastName: "One",
        hash: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
      {
        email: "owner2@gmail.com",
        firstName: "Owner",
        lastName: "Two",
        hash: hashedPassword,
        role: Role.SUPER_ADMIN,
      }
    ],
  });


  console.log("Two SUPER_ADMIN users created");
}


main()
.then(async () => {
  await prisma.$disconnect();
})
.catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
});