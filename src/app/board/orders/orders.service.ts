import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable, Subject } from 'rxjs/Rx';
import { Order } from './order';
// import { OrdersResult } from './orders-result';

@Injectable()
export class Orders {
  private urlPrefix: string =
    'https://9rjbuh16l0.execute-api.us-east-1.amazonaws.com/prod/distro/shipping/';
  private items: any;
  private pollInterval: number = 60 * 1000;
  private ordersResults: any;
  private updateSubject: Subject<any>;
  constructor(
    public http: Http
  ) {
    this.items = {};
    this.ordersResults = {
      Count: 0,
      Items: []
    };
    this.updateSubject = new Subject();
    this.startPolling();
  }
  public getOrders(): Observable<any> {
    return Observable.merge(Observable.of(this.ordersResults), this.updateSubject)
      .map( (x) => {
        return this.ordersResults;
      });
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
    order.ShippedDate = new Date().toISOString();
    // TODO: consider moving this logic to the API so we don't have to make to REST calls
    return this.http.put(shipUrl, order)
      .map( (results) => results.json())
      .flatMap( (x) => this.deleteOrder(order))
      .map( (deleteResults) => {
        // manually remove the order for Items so we don't have to wait for the next
        // poll interval
        this.ordersResults.Items = this.ordersResults.Items.filter( (i) => i.TxnID !== order.TxnID);
        this.updateSubject.next(true);
        return deleteResults.json();
      });
    ;
  }
  public removeOrder(order: any): Observable<any> {
    return this.deleteOrder(order);
  }
  public putOrder(order: any) {
    let url = this.urlPrefix + `${order.TxnID}/`;
    // reset the StoreNumber so it's consistent in DB
    this.displayStoreNumber(order);
    return this.http.put(url, order);
  }
  private startPolling(): void {
    Observable.interval(this.pollInterval)
          .startWith(0)
          .switchMap( () => this.makeHttpRequest())
          .subscribe( (results) => {
            // TODO: change update subject to Subject<Order> and send next properly
            results.Items.forEach( (item) => {
              if (!this.items[item.TxnID]) {
                // we have a new item
                this.items[item.TxnID] = item;
                this.updateSubject.next(true);
              }
            });
            if (JSON.stringify(this.ordersResults) !== JSON.stringify(results)) {
              this.ordersResults = results;
              this.updateSubject.next(true);
            }
          });
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
      return results;
    });
  }
  private deleteOrder(order): Observable<any> {
    let deleteUrl = this.urlPrefix + `${order.TxnID}/`;
    return this.http.delete(deleteUrl);
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
