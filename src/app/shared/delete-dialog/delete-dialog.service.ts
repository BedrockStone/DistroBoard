import { Observable } from 'rxjs/Rx';
import { DeleteDialogComponent } from './delete-dialog.component';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Injectable } from '@angular/core';

@Injectable()
export class DialogsService {

    constructor(private dialog: MdDialog) { }

    public confirm(
        title: string = 'Confirm',
        message: string = 'Are you sure you wish to delete this item?'): Observable<boolean> {

        let dialogRef: MdDialogRef<DeleteDialogComponent>;

        dialogRef = this.dialog.open(DeleteDialogComponent);
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed().map( (result) => result === 'Yes');
    }
}
