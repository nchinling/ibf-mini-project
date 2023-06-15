import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';

import { leaveComp, loginGuard} from './util';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main.component';
import { OrderComponent } from './components/order.component';
import { DashboardComponent } from './components/dashboard.component';
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from './account.service';
import { NavbarComponent } from './components/navbar.component';
import { NgbCollapse, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from './components/register.component';
import { LearnComponent } from './components/main/learn.component';
import { AboutComponent } from './components/main/about.component';
import { TutorialComponent } from './components/main/tutorial.component';
import { StockService } from './stock.service';
import { ResearchComponent } from './components/research.component';

const appRoutes: Routes = [
  { path: '', component: MainComponent, title: 'Welcome to Tradeus' },
  { path: 'main/learn', component: LearnComponent, title: 'Learn' },
  { path: 'main/tutorial', component: TutorialComponent, title: 'Getting Started' },
  { path: 'main/about', component: AboutComponent, title: 'About Us' },
  { path: 'login', component: LoginComponent, title: 'Log In' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  // { path: 'dashboard/:userId', component: DashboardComponent, canActivate: [ loginGuard ] },
  // { path: 'dashboard', component: DashboardComponent, canActivate: [ loginGuard ] },
  { path: 'dashboard/:parsedUsername', component: DashboardComponent, title: 'DashBoard', canActivate: [loginGuard]},
  { path: 'research', component: ResearchComponent, title: 'Research', canActivate: [ loginGuard] },
  { path: 'order', component: OrderComponent, title: 'Order'
      , canActivate: [ loginGuard], canDeactivate: [ leaveComp ] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    DashboardComponent, 
    OrderComponent, NavbarComponent, RegisterComponent, 
    LearnComponent, AboutComponent, TutorialComponent, ResearchComponent,
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, HttpClientModule,
    // bindToComponentInputs - V16
    // RouterModule.forRoot(appRoutes, { useHash: true, bindToComponentInputs: true })
    RouterModule.forRoot(appRoutes, { useHash: true}),
    NgbModule
  ],
  providers: [AccountService, StockService],
  bootstrap: [AppComponent]
})
export class AppModule { }
