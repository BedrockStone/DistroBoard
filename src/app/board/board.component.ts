import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Orders } from './orders/orders.service';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs/Observable';
import { MdSort } from '@angular/material';
import { OrdersDataSource } from './orders/orders-data-source';
import { DialogsService } from '../shared/delete-dialog/delete-dialog.service';

@Component({
    moduleId: 'BoardComponent',
    selector: 'board',
    providers: [
    Orders,
    DialogsService
    ],
    templateUrl: 'board.component.html',
    styleUrls: ['board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
    protected items: any = [];
    protected count: Number;
    protected lastUpdated: any = {};
    protected ordersDataSource: OrdersDataSource | null;
    @ViewChild(MdSort)
    protected sort: MdSort;
    protected allOrders: boolean = true;
    protected displayedColumns = [
        'ID',
        'ShipDate',
        'RctDate',
        'Yard',
        'Cashier',
        'Customer',
        'Items',
        'Action'];
    private poll: any;

    constructor(
        private orders: Orders,
        private dialogsService: DialogsService) { }
    public ngOnInit() {
        this.ordersDataSource = new OrdersDataSource(this.orders, this.sort);
        this.getData();
        this.orders.getLastUpdated().subscribe( (results) => {
            this.lastUpdated = results;
        });
    }
    public ngOnDestroy(): void {
        clearInterval(this.poll);
    }
    public shipOrder(order): void {
        this.dialogsService.confirm('Are you sure you wish to mark this order as shipped?')
            .subscribe( (results) => {
                if (results) {
                    this.orders.shipOrder(order).subscribe( (x) => {
                        this.ordersDataSource.RemoveItem(order);
                    });
                }
            });
    }
    public filter(allOrders: boolean) {
        if (allOrders) {
            this.ordersDataSource.RemoveFilter();
        } else {
            this.ordersDataSource.Filter( (order) => order['ShipDate'] === undefined);
        }
        this.allOrders = allOrders;
    }
    private getData(): void {
        this.orders.getOrders().subscribe((data) => {
           this.count = data.Count;
        });
    }
}
