
import { MdSort } from '@angular/material/material';
import { Orders } from 'src/app/board/orders';
import { Observable } from 'rxjs/Observable';
import { DataSource } from '@angular/cdk';

export class OrdersDataSource extends DataSource<any> {
    public items: any[];
    constructor(private orders: Orders, private sort: MdSort) {
        super();
        this.orders = orders;
        this.sort = sort;
    }
    public connect(): Observable<any[]> {
       return Observable.merge(this.sort.mdSortChange, this.orders.getOrders())
        .map( (results) => this.sortItems(results.Items));
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
