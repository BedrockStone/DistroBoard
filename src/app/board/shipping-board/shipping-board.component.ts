import { Component, OnInit } from '@angular/core';
import { Orders } from '../orders/orders.service';
@Component({
    moduleId: 'ShippingBoardComponent',
    selector: 'shipping-board',
    templateUrl: 'shipping-board.component.html',
    styleUrls: ['shipping-board.component.scss'],
    providers: [Orders]
})
export class ShippingBoardComponent implements OnInit {
    protected Days = [];
    constructor(private ordersService: Orders) { }
    public ngOnInit(): void {
        let current = new Date();
        let currentUTC = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
        current = new Date(currentUTC);
        current.setHours(0);
        let dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'];
        while (this.Days.length < 6) {
            let day = {
                orders: []
            };
            day['date'] = current;
            if (current.getDay() !== 6) {
                this.Days.push(day);
            }
            current = new Date(current.setTime( current.getTime() + 1 * 86400000 ));
        }
        this.ordersService.getOrders().subscribe( (orders) => {
            this.Days.forEach( (day) => {
                let expectedDate = day.date.getDate();
                day.orders = orders.Items.filter( (order) => {
                    return new Date(`${order.ShipDate}T00:00:00`).getDate() === expectedDate;
                });
            });
        });
    }
    protected ship(order) {
        this.ordersService.shipOrder(order).subscribe();
        // todo, I don't think we need to remove the item
    }
}
