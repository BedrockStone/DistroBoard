import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable, Subject } from 'rxjs/Rx';
import { Orders } from './orders.service';

@Injectable()
export class Schedule {
    constructor(private ordersService: Orders) { }

    /// Returns an Observable array of Days containing orders by ShipDate
    public getSchedule(startDate: Date): Observable<any> {

        // TODO: move this date stuff to a service
        let current = startDate;
        let currentUTC = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
        current = new Date(currentUTC);
        current.setHours(0);
        let dayNames = ['Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'];
        let days = [];
        let unscheduled = [];
        while (days.length < 6) {
            let day = {
                orders: []
            };
            day['date'] = current;
            if (current.getDay() !== 6) {
                days.push(day);
            }
            current = new Date(current.setTime( current.getTime() + 1 * 86400000 ));
        }
        return this.ordersService.getOrders().map( (orders) => {
            // find unscheduled orders
            // unscheduled = orders.Items.filter( (order) => !order['ShipDate']);
            days.forEach( (day) => {
                let expectedDate = day.date.getDate();
                day.orders = orders.Items.filter( (order) => {
                    // if it has a time, ignore it
                    let shipDate = order.ShipDate;
                    if (!shipDate) {
                        return false;
                    }
                    debugger;
                    if (shipDate.indexOf(' ') === -1) {
                        shipDate = shipDate + 'T00:00:00';
                    }
                    return new Date(shipDate).getDate() === expectedDate;
                });
            });
            return days;
        });
    }
    /// Returns all orders that have no ship date
    public getUnscheduled(): Observable<any[]> {
        return this.ordersService.getOrders().map( (orders) => {
            return orders.Items.filter( (order) => !order['ShipDate']);
        });
    }
}
