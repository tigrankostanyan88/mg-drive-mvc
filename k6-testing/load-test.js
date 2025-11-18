import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '15s'
};

export default function() {
  const res = http.post('http://localhost:3400/api/v1/test');
  check(res, {
    'status: was 200': (r) => r.status === 200,
    'duration was <= 200ms': (r) => r.timings.duration <= 200 
  });
  sleep(1);
}
