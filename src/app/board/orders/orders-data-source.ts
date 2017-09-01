
import { MdSort } from '@angular/material/material';
import { Orders } from 'src/app/board/orders';
import { Observable } from 'rxjs/Observable';
import { DataSource } from '@angular/cdk/table';
import { EventEmitter } from '@angular/core/src/event_emitter';
import { Subject } from 'rxjs/Subject';

export class OrdersDataSource extends DataSource<any> {
    public items: any[];
    private deleteSubject: Subject<any>;
    private filterSubject: Subject<any>;
    private filter: (para: any) => boolean;
    constructor(private orders: Orders, private sort: MdSort) {
        super();
        this.orders = orders;
        this.sort = sort;
        this.deleteSubject = new Subject();
        this.filterSubject = new Subject();
        this.filter = (x) => true;
    }
    public connect(): Observable<any[]> {
        return Observable.merge(this.sort.mdSortChange,
            this.orders.getOrders(),
            this.deleteSubject,
            this.filterSubject
        )
        .map( (results) => {
            let items = this.sortItems(results.Items);
            return items.filter(this.filter);
        });
    }
    public RemoveItem(order: any): void {
        this.items = this.items.filter(( item ) => item.TxnID !== order.TxnID);
        // we already mutated items, just emit an event to the delete subject
        this.deleteSubject.next({});
    }
    public Filter(filterFunc: (param: any) => boolean): void {
        // this.items = this.items.filter(predicate);
        this.filter = filterFunc;
        this.filterSubject.next({});
    }
    public RemoveFilter() {
        this.filter = (x) => true;
        this.filterSubject.next({});
    }
    public disconnect(): void {
        let x = 0;
    }
    public sortItems(items: any[]): any[] {
        if (items) {
            this.items = items;
        }
        return this.items.sort((a, b) => {
            if ( a[this.sort.active] > b[this.sort.active]) {
                return  this.sort.direction !== 'desc' ? 1 : -1;
            } else if (b[this.sort.active] > a[this.sort.active]) {
                return  this.sort.direction !== 'desc' ? -1 : 1;
            } else {
                return 0;
            }
        });
    }
}
