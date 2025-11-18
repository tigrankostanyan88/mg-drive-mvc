import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 3,
  duration: '15s',
};

function randomString(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function () {
  const payload = {
    fullName: "TestUser_" + randomString(6),
    email: randomString(6) + "@test.com",
    password: "Pass1234!",
    confirmPassword: "Pass1234!",
    country: "Country_" + randomString(4),
    language: "en",
    telegramId: "tg_" + randomString(8),
  };

  const res = http.post(
    'http://localhost:4000/api/v1/auth/register',
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // ԱՅՍՆ Է ՀԻՄՆԱԿԱՆԸ — ՀԵՆՑ ՍԱ պահպանիր
  if (res.status !== 200 && res.status !== 201) {
    console.error("============ ERROR ============");
    console.error("STATUS:", res.status);
    console.error("BODY:", res.body);
    console.error("================================");
  }

  check(res, {
    'status 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(0.3);
}
