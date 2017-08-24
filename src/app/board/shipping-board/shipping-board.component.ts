import { Component, OnInit } from '@angular/core';
import { Schedule } from '../orders/schedule.service';
import { Orders } from '../orders/orders.service';
import { MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogsService } from '../../shared/delete-dialog/delete-dialog.service';

@Component({
    moduleId: 'ShippingBoardComponent',
    selector: 'shipping-board',
    templateUrl: 'shipping-board.component.html',
    styleUrls: ['shipping-board.component.scss'],
    providers: [Schedule, Orders, DialogsService]
})
export class ShippingBoardComponent implements OnInit {
    protected Days = [];
    protected Unscheduled = [];
    private date: Date;
    private lastRefresh: Date;
    private MIN: number = 1000 * 60;
    private HOUR: number = 60 * this.MIN;
    constructor(
        private scheduleService: Schedule,
        private ordersService: Orders,
        private router: Router,
        private route: ActivatedRoute,
        private dialogsService: DialogsService
    ) { }
    public ngOnInit(): void {
        this.lastRefresh = new Date();
        setTimeout(() => {
            if (this.lastRefresh.getDate() === new Date().getDate()) {
                window.location.reload(true);
            }
        } , this.HOUR);

        this.route.params.subscribe( (routeParams) => {
            this.date = new Date();
            if (routeParams['date']) {
                this.date = new Date(routeParams['date']);
            }
            this.setDateToMidnight();
            this.scheduleService.getSchedule(this.date)
                .subscribe((schedule) => this.Days = schedule);
        });

        this.scheduleService.getUnscheduled()
        .subscribe( (results) => this.Unscheduled = results);
    }
    protected ship(order) {
        let that = this;
        this.dialogsService.confirm('Confirm Shipping', 'Are you sure you wish to ship this item?')
        .subscribe( (results) => {
            if (results) {
                that.ordersService.shipOrder(order).subscribe();
            }
        });
    }
    protected next(): void {
        this.date.setDate(this.date.getDate() + 1);
        this.router.navigate(['shipping', this.dateString()]);
    }
    protected previous(): void {
        this.date.setDate(this.date.getDate() - 1);
        this.router.navigate(['shipping', this.dateString()]);
    }
    private dateString(): string {
        return this.date.getFullYear() + '-' +
        (this.date.getMonth() + 1) + '-' +
        this.date.getDate();
    }
    private setDateToMidnight(): void {
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
    }
}
