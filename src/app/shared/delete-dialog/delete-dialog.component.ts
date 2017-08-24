import { Component } from '@angular/core';
import { MdDialog } from '@angular/material';

@Component({
    moduleId: 'DeleteDialogComponent',
    templateUrl: 'delete-dialog.component.html',
    styleUrls: ['delete-dialog.component.scss']
})

export class DeleteDialogComponent {
    public title: string;
    public message: string;
}
