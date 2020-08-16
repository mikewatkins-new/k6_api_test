import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';export let errorRate = new Rate('errors');

export let clientErrorCount = new Rate('4xx');
export let serverErrorCount = new Rate('5xx');
export let options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "1m", target: 100 },
  ],
  thresholds: {}
};

export default function() {
  var payload = JSON.stringify({
    'JOBSEEKER_ID': '0178ee0495b81bfc12aa1700'
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let res = http.post('http://10.107.10.83:80/invocations/', payload, params);
  //let res = http.get('http://10.107.10.83:8080/ok')
  let result = check(res, {
    'status is 200': (r) => r.status == 200,
  });

  if (!result) {
    console.log('HTTP Error code was ' + String(res.status) + 'Request was: ' + res.request.body + 'Response was: ' + res.body);
    errorRate.add(1)
    if(res.status >= 500) {
      serverErrorCount.add(1)
    } else {
      clientErrorCount.add(1)
    };
  } else {
    errorRate.add(0)
    clientErrorCount.add(0)
    serverErrorCount.add(0)
  };
  sleep(1);
}
