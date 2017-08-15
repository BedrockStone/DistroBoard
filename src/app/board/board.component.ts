import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Orders } from './orders/orders.service';
import { DataSource, CollectionViewer } from '@angular/cdk';
import { Observable } from 'rxjs/Observable';
import { MdSort } from '@angular/material';
import { OrdersDataSource } from './orders/orders-data-source';

@Component({
    moduleId: 'BoardComponent',
    selector: 'board',
    providers: [
    Orders
    ],
    templateUrl: 'board.component.html',
    styleUrls: ['board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
    protected items: any = [];
    protected count: Number;
    protected ordersDataSource: OrdersDataSource | null;
    @ViewChild(MdSort)
    protected sort: MdSort;
    protected displayedColumns = [
        'ID',
        'Yard',
        'Cashier',
        'RctDate',
        'Customer',
        'ShipDate',
        'Items',
        'Action'];
    private poll: any;

    constructor(private orders: Orders) { }
    public ngOnInit() {
        this.ordersDataSource = new OrdersDataSource(this.orders, this.sort);
        this.getData();
    }
    public ngOnDestroy(): void {
        clearInterval(this.poll);
    }
    public shipOrder(order): void {
        if (!confirm('Are you sure you wish to mark this order as shipped?')) {
            return;
        }
        this.orders.shipOrder(order).subscribe((x) => {
            this.getData();
        });
    }
    private getData(): void {
        this.orders.getOrders().subscribe((data) => {
           this.count = data.Count;
        });
    }
}
