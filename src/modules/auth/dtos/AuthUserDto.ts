export class AuthUserDto {
  id!: string;

  email!: string | null;

  name!: string | null;

  roles!: string[];

  constructor(data: AuthUserDto) {
    Object.assign(this, data);
  }
}
