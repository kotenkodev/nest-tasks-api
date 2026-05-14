import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto = new CreateUserDto();

  beforeEach(() => {
    dto = new CreateUserDto();
  });

  it('should validate the DTO', async () => {
    dto.email = 'test@domain.com';
    dto.name = 'Test User';
    dto.password = 'P@ssword123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate with email', async () => {
    dto.email = 'invalid-email';
    dto.name = 'Test User';
    dto.password = 'P@ssword123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  const testPassword = async (password: string, expectedMessage: string) => {
    dto.password = password;

    const errors = await validate(dto);

    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).not.toBeUndefined();

    const messages = Object.values(passwordError?.constraints ?? {});
    expect(messages).toContain(expectedMessage);
  };

  it('should fail without 1 uppercase letter in password', async () => {
    await testPassword(
      'password123',
      'Password must contain at least 1 uppercase letter',
    );
  });

  it('should fail without 1 special character in password', async () => {
    await testPassword(
      'Password123',
      'Password must contain at least 1 special character',
    );
  });

  it('should fail without 1 number in password', async () => {
    await testPassword('Password@', 'Password must contain at least 1 number');
  });
});
