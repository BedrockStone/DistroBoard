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
  // TODO: there's no way to force an update here... consider exposing an observable
  // of the Items from get so we can remove them as needed without waiting for the interval
  public getOrders(sort: string = 'TimeCreated'): Observable<any> {
    return Observable.interval(this.pollInterval)
          .startWith(0)
          .switchMap( () => this.makeHttpRequest());
  }
  // returns an observable containing information about last time orders where received from stores
  public getLastUpdated(): Observable<any> {
    let url = 'https://9rjbuh16l0.execute-api.us-east-1.amazonaws.com/prod/distro/lastorder';
    return Observable.interval(this.pollInterval)
      .startWith(0)
      .switchMap( () => this.http.get(url).map( (results) => {
        let raw = results.json();
        raw['Items'].forEach( (item) => {
          this.displayStoreNumber(item);
          let date = new Date(item.LastUpdated);
          date.setHours(date.getHours() + 1);
          item.LastUpdated = date;
        });
        // these hours are off by 2, we need to fix it long term, for now, who cares

        return raw;
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
  public shipOrder(order: any): Observable<Response> {
    let shipUrl = 'https://9rjbuh16l0.execute-api.us-east-1.amazonaws.com/prod/distro/ship';
    let deleteUrl = this.urlPrefix + `${order.TxnID}/`;
    order.ShippedDate = new Date().toISOString();
    // TODO: consider moving this logic to the API so we don't have to make to REST calls
    return this.http.put(shipUrl, order)
      .map( (results) => results.json())
      .flatMap( (shipResults) => this.http.delete(deleteUrl))
      .map( (deleteResults) => deleteResults.json());
    ;
  }
  public putOrder(order: any) {
    let url = this.urlPrefix + `${order.TxnID}/`;
    // reset the StoreNumber so it's consistent in DB
    this.displayStoreNumber(order);
    return this.http.put(url, order);
  }
  private makeHttpRequest() {
    let url = this.urlPrefix;
    return this.http.get(url).map((res) => {
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
            this.displayStoreNumber(item);
            this.setShipBy(item);
        });
      results.Items.forEach((r) => this.items[r.TxnID] = r);
      return results;
    });
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
  private getFromCache(txnID: string): any {
    return this.items[txnID];
  }
  private fixTenderType(order: any): any {
    order.TenderType = order.TenderType.replace('$Credit Car^', 'Credit Card');
    return order;
  }
  private displayStoreNumber(order: any): any {
    let maps = {
      4: 3,
      3: 4
    };
    if (Object.keys(maps).find( (key) => key === order.StoreNumber.toString())) {
      order.StoreNumber = maps[order.StoreNumber];
    }
    return order;
  }
  private setShipBy(order: any): any {
    order.ShipBy = 'Dump';
    let shippingRow = order.receiptItems
      .find( (item) => item.SalesReceiptItemDesc1.search(/^D([0-9]|Q).$/) !== -1);

    if (shippingRow.SalesReceiptItemDesc1.endsWith('F')) {
      order.ShipBy = 'Flatbed';
    }
    return order;
  }
}
