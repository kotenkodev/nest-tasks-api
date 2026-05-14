import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
});

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', async () => {
    const mockHashedPassword = 'hashedPassword';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

    const hashedPassword = await service.hash('testpassword');
    expect(hashedPassword).toBe(mockHashedPassword);
    expect(bcrypt.hash).toHaveBeenCalledWith(
      'testpassword',
      service['SALT_ROUNDS'],
    );
  });

  it('should verify a password', async () => {
    const mockHashedPassword = 'hashedPassword';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const hashedPassword = await service.hash('testpassword');
    const isMatch = await service.verify('testpassword', hashedPassword);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'testpassword',
      mockHashedPassword,
    );
    expect(isMatch).toBe(true);
  });

  it('should fail on an incorrect password', async () => {
    const mockHashedPassword = 'hashedPassword';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const hashedPassword = await service.hash('testpassword');
    const isMatch = await service.verify('testpassword', hashedPassword);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'testpassword',
      mockHashedPassword,
    );
    expect(isMatch).toBe(false);
  });
});
