import request from './request';
import qs from 'querystring';
import crypto from 'crypto';

const DOMAIN = 'http://data.bter.com';

export default class {
  constructor({key, secret, version = '1'}) {
    this._key = key;
    this._version = version;
    this._secret = secret;

    // public api
    ['pairs', 'marketInfo', 'marketList', 'tickers', 'orderBooks'].forEach(item => {
      this[item] = () => {
        const api = this._makeApi(item.toLowerCase());
        return this._get(api);
      };
    });

    ['ticker', 'orderBook', 'tradeHistory'].forEach(item => {
      this[item] = pair => {
        pair = pair || this.pair;
        const api = this._makeApi(`${item.toLowerCase()}/${pair}`);
        return this._get(api);
      };
    });

    // private api
    ['balances', 'openOrders'].forEach(item => {
      this[item] = () => {
        const api = this._privateApi(item.toLowerCase());
        return this._post(api);
      };
    });
  }

  setupDefaultPair(currency, asset) {
    this._pair = `${asset.toLowerCase()}_${currency.toLowerCase()}`;
  }

  get pair() {
    if (!this._pair) {
      throw new Error('undefined default currency pair');
    }
    return this._pair;
  }

  // PRIVATE api
  depositAddress(currency) {
    const api = this._privateApi('depositeAddress');
    return this._post(api, {currency});
  }

  depositsWithdrawals(start, end) {
    const api = this._privateApi('depositsWithdrawals');
    return this._post(api, {start, end});
  }

  buy(rate, amount, pair) {
    pair = pair || this.pair;
    const api = this._privateApi('buy');
    return this._post(api, {currencyPair: pair, rate, amount});
  }

  sell(rate, amount, pair) {
    pair = pair || this.pair;
    const api = this._privateApi('sell');
    return this._post(api, {currencyPair: pair, rate, amount});
  }

  getOrder(order, pair) {
    pair = pair || this.pair;
    const api = this._privateApi('getOrder');
    return this._post(api, {orderNumber: order, currencyPair: pair});
  }

  cancelOrder(order, pair) {
    pair = pair || this.pair;
    const api = this._privateApi('cancelOrder');
    return this._post(api, {orderNumber: order, currencyPair: pair});
  }

  cancelAllOrders(type, pair) {
    pair = pair || this.pair;
    const api = this._privateApi('cancelAllOrders');
    return this._post(api, {type, currencyPair: pair});
  }

  tradeHistory(pair, order = undefined) {
    pair = pair || this.pair;
    const api = this._privateApi('tradeHistory');
    return this._post(api, {orderNumber: order, currencyPair: pair});
  }

  withdraw(currency, amount, address) {
    const api = this._privateApi('withdraw');
    return this._post(api, {currency, amount, address});
  }

  // Utils
  _makeApi(name) {
    return `/api2/${this._version}/${name}`;
  }

  _privateApi(name) {
    return this._makeApi(`private/${name}`);
  }

  _signature(form = {}) {
    form.nonce = new Date().getTime();
    const temp = qs.stringify(form);
    return crypto.createHmac('sha512', this._secret)
      .update(temp)
      .digest('hex');
  }

  _get(api, qs) {
    const uri = DOMAIN + api;
    return request.get({uri, qs});
  }

  _post(api, form = {}) {
    const uri = DOMAIN + api;
    const SIGN = this._signature(form);
    const headers = {KEY: this._key, SIGN};
    return request.post({uri, form, headers});
  }
}
