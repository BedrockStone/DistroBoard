import { Component, OnInit, OnDestroy } from '@angular/core';
import { Orders } from '../orders/orders.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    moduleId: 'OrderDetailComponent',
    selector: 'order-detail',
    providers: [
    Orders
    ],
    templateUrl: 'order-detail.component.html',
    styleUrls: ['order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
    protected order: any;
    protected minDate: string = new Date().toISOString().split('T')[0];
    protected maxDate: string = '2100-01-01';
    private paramsSub: any = '';
    private txnID: string = '';
    constructor(private orders: Orders, private route: ActivatedRoute) {
    }
    public ngOnInit(): void {
        this.paramsSub = this.route.params.subscribe((params) => {
            this.txnID = params.txnID;
            this.orders.getOrder(this.txnID).subscribe((o) => this.order = o);
        });
    }
    public ngOnDestroy(): void {
        this.paramsSub.unsubscribe();
    }
    public print(): void {
        window.print();
    }
    public update() {
        this.orders.putOrder(this.order).subscribe();
    }
}
