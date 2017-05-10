// import assert from 'assert';
import HamalBter from '../lib';

const client = new HamalBter({
  key: '',
  secret: ''
});

client.setupDefaultPair('cny', 'bts');

describe('hamal-bter', function () {
  it('should have unit test!', function (done) {
    // assert(false, 'we expected this package author to add actual unit tests.');
    // client.orderBook().then(data => {
    //   console.log(data);
    //   done();
    // });
    client
      // .balances()
      .buy(0.01, 1000)
      // .buy(0.01, 1000, 'bts_cny')
      .then(data => {
        console.log(data);
        done();
      });
  });
});
