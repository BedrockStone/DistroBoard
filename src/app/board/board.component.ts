import { Component, OnInit, OnDestroy } from '@angular/core';
import { Orders } from './orders/orders.service';
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
    protected items: any;
    protected count: Number;
    private poll: any;
    constructor(private orders: Orders) { }
    public ngOnInit() {
        this.getData();
        this.poll = setInterval( () => this.getData(), 10000);
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
        this.orders.getOrders(1).subscribe((data) => {
           this.items = data.Items;
           this.count = data.Count;
        });
    }
}
