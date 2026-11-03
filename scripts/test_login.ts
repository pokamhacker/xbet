import { login } from '../src/controllers/authController';

async function main() {
  const req: any = {
    body: {
      username: 'bookmekerstudio',
      password: 'Bolingo2024##?',
      deviceId: 'test-device'
    }
  };
  const res: any = {
    status: (code: number) => {
      console.log('STATUS:', code);
      return {
        json: (data: any) => console.log('DATA:', JSON.stringify(data, null, 2))
      };
    }
  };

  try {
    await login(req, res);
  } catch (err: any) {
    console.error('CATCH ERR:', err);
  }
}

main();
