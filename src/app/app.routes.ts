import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { BoardComponent } from './board';
import { NoContentComponent } from './no-content';
import { OrderDetailComponent }  from './board/order-detail';
import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: BoardComponent },
  { path: 'board', component: BoardComponent},
  { path: 'orders/:txnID', component: OrderDetailComponent},
  { path: '**',    component: NoContentComponent },
];
