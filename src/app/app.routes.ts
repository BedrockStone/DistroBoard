import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { BoardComponent } from './board';
import { OrderDetailComponent }  from './board/order-detail';
import { ShippingBoardComponent } from './board/shipping-board/';
import { NoContentComponent } from './no-content';
import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: BoardComponent },
  { path: 'board', component: BoardComponent},
  { path: 'shipping/:date', component: ShippingBoardComponent},
  { path: 'shipping', component: ShippingBoardComponent},
  { path: 'orders/:txnID', component: OrderDetailComponent},
  { path: '**',    component: NoContentComponent },
];
