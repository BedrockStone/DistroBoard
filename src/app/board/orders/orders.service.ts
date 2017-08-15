import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { Order } from './order';
// import { OrdersResult } from './orders-result';

@Injectable()
export class Orders {
  private urlPrefix: string =
    'https://9rjbuh16l0.execute-api.us-east-1.amazonaws.com/prod/distro/shipping/';
  private items: any;
  private pollInterval: number = 60 * 1000;
  constructor(
    public http: Http
  ) {
    this.items = {};
  }
  // TODO: don't just expose the HTTP observable, let's hide polling, etc...
  public getOrders(sort: string = 'TimeCreated'): Observable<any> {
    let url = this.urlPrefix;
    return Observable.interval(this.pollInterval)
          .startWith(0)
          .switchMap( () => this.http.get(url).map((res) => {
      let results = res.json();
      results.Items.forEach((item) => {
            if (!item.receiptItems) {
              item.receiptItems = [];
              Object.keys(item.Lines).forEach((key) => {
                  item.receiptItems.push(item.Lines[key]);
              });
            }
            this.copyShippingInfoFromBillingInfo(item);
            this.fixTenderType(item);
        });
      results.Items.forEach((r) => this.items[r.TxnID] = r);
      return results;
    }));
  }
  public getOrder(txnID: string): Observable<Order> {
    let fromCache = this.getFromCache(txnID);
    if (fromCache) {
      return Observable.of(fromCache);
    }
    return this.getOrders().map( (data) => {
      return this.getFromCache(txnID);
    });
  }
  public shipOrder(order: any) {
    let url = this.urlPrefix + `${order.TxnID}/`;
    return this.http.delete(url);
  }
  public putOrder(order: any) {
    let url = this.urlPrefix + `${order.TxnID}/`;
    return this.http.put(url, order);
  }
  /// This method copies BillingInformation into shipping information
  private copyShippingInfoFromBillingInfo(order) {
    /* ShippingInformation
    *  BillingInformation
    */
    let fieldSuffixes = [
      'CompanyName',
      'Street',
      'City',
      'State',
      'PostalCode',
      'Phone'
    ];
    if ( fieldSuffixes.find((suffix) => order[`ShippingInformation${suffix}`]) ) {
      return;
    }

    fieldSuffixes.forEach((suffix) => {
      if (order[`BillingInformation${suffix}`]) {
        order[`ShippingInformation${suffix}`] = order[`BillingInformation${suffix}`];
      }
    });
    if (order.ShippingInformationFullName) {
      return;
    }
    if (order.BillingInformationFirstName) {
      order.ShippingInformationFullName = order.BillingInformationFirstName;
    }
    if (order.BillingInformationLastName) {
      order.ShippingInformationFullName =  order.ShippingInformationFullName ?
        order.ShippingInformationFullName + ' ' + order.BillingInformationLastName :
        order.BillingInformationLastName;
    }
  }
  private getFromCache(txnID: string) {
    return this.items[txnID];
  }
  private fixTenderType(order): any {
    order.TenderType = order.TenderType.replace('Credit Car', 'Credit Card');
    return order;
  }
}
