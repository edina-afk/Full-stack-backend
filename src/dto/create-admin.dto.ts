export class CreateAdminDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName?: string;
  superAdminEmail!: string;
}