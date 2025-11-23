import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '20s'
};

export default function() {
  const res = http.patch('http://localhost:3400/api/v1/user');
  check(res, {
    'status: was 200': (r) => r.status === 200,
    'duration was <= 200ms': (r) => r.timings.duration <= 200 
  });
  sleep(1);
}
