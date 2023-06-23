import { Component, HostListener, Injectable, Input, OnChanges, OnInit, inject } from '@angular/core';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { AccountService } from '../account.service';
import { LoginResponse, MarketIndex, RegisterResponse, Stock, Market, StockInfo, PortfolioData } from '../models';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../stock.service';


@Injectable()
@Component({
  selector: 'app-dashboard', 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnChanges{


  stockSvc = inject(StockService)
  accountSvc = inject(AccountService)
  activatedRoute = inject(ActivatedRoute)
  router = inject(Router)
  title = inject(Title)

  loginResponse$!: Observable<LoginResponse>
  registerResponse$!: Observable<RegisterResponse>
  errorMessage$!: Observable<string>
  username!: string
  parsedUsername!: string
  status!: string
  timestamp!: string
  accountId!: string

  markets: Market[] = [
    { symbol: "SPX", interval: "1day" },
    { symbol: "VIX", interval: "1day" },
    { symbol: "IXIC", interval: "1day" },
    { symbol: "DJI", interval: "1day" },
    { symbol: "RUT", interval: "1day" }
  ];

  snp500: string[ ] = [
    'AAPL', 'MSFT', 'AMZN', 'NVDA' , 'GOOGL', 'TSLA', 'GOOG', 'META', 'BRK.B', 'XOM'
  ];

  nasdaq: string[] = [
    'MSFT', 'AAPL', 'NVDA', 'AMZN', 'TSLA', 'META', 'GOOGL', 'GOOG', 'AVGO', 'PEP'
  ];

  marketIndex$!: Promise<MarketIndex[]>

  //for watchlist
  stockSymbol$!: Observable<string>
  symbols$!:Promise<string[]>
  symbols!:string[]
  symbol!:string
  watchList$!: Promise<Stock[]>
  indexSnP$!: Promise<Stock[]>
  indexNasdaq$!: Promise<Stock[]>

  portfolioSymbols$!:Promise<string[]>
  portfolioData$!:Promise<PortfolioData[]>


  onStockRequest = new Subject<string>()

  //for ng-bootstrap nav
  active = 1;



 ngOnInit():void{
    // this.loginResponse$ = this.accountSvc.onLoginRequest
    this.registerResponse$ = this.accountSvc.onRegisterRequest
    this.loginResponse$ = this.accountSvc.onLoginRequest
    this.errorMessage$ = this.accountSvc.onErrorMessage


        // Access the query parameters
        const queryParams = this.activatedRoute.snapshot.queryParams;
        
        // Example: Access specific query parameters
        this.status = queryParams['status'];
        this.timestamp = queryParams['timestamp'];
        this.accountId = queryParams['account_id'];
        this.username = queryParams['username'];

        this.title.setTitle(`Account: ${this.accountSvc.username}`)

        console.log('Status:', this.status);
        console.log('Timestamp:', this.timestamp);
        console.log('Account ID:', this.accountId);
        console.log('Username:', this.username);

        if(localStorage.getItem('username')){
          this.username = this.accountSvc.username
          this.accountId = this.accountSvc.account_id
        } else{
        }

      //initialise portfolio
      this.portfolioSymbols$ = this.stockSvc.getPortfolioSymbols(this.accountId)
      console.info('this.symbols$ is' + this.portfolioSymbols$)
  
      this.portfolioSymbols$.then((symbol: string[]) => {
        console.info('Symbols:', symbol);
        this.portfolioData$ = this.stockSvc.getPortfolioData(symbol, this.accountId);
      }).catch((error) => {
        console.error(error);
      });


      //load market data
      // this.marketIndex$ = this.stockSvc.getMarketData('SPX', '1day');
      this.marketIndex$ = this.stockSvc.getMarketData(this.markets)
      this.indexSnP$ = this.stockSvc.getStocklistData(this.snp500)
      this.indexNasdaq$ = this.stockSvc.getStocklistData(this.nasdaq)
      this.stockSymbol$ = this.stockSvc.onStockSelection
      console.info('I am in dashboard')
      this.symbol=this.stockSvc.symbol
      this.symbols = this.stockSvc.symbols
      console.info('this.symbols in ngOnInit are:' + this.symbols)
      this.symbols$ = this.stockSvc.getWatchlist(this.username)
      console.info('this.symbols$ is' + this.symbols$)
      // this.watchList$ = this.stockSvc.getWatchlistData(this.symbols);
      // this.symbols$ = this.stockSvc.getWatchlist(this.username);

      this.symbols$.then((symbol: string[]) => {
        console.info('Symbols:', symbol);
        this.watchList$ = this.stockSvc.getStocklistData(symbol);
      }).catch((error) => {
        console.error(error);
      });
      

  }

  ngAfterViewInit():void{


  }

  ngOnChanges(): void{
    // this.symbols$ = this.stockSvc.getWatchlist(this.username)
    // console.info('this.symbols$ is' + this.symbols$)

    // // this.watchList$ = this.stockSvc.getWatchlistData(this.symbols);
    // // this.symbols$ = this.stockSvc.getWatchlist(this.username);

    // this.symbols$.then((symbol: string[]) => {
    //   console.info('Symbols:', symbol);
    //   this.watchList$ = this.stockSvc.getStocklistData(symbol);
    // }).catch((error) => {
    //   console.error(error);
    // });

  }

  viewStock(symbol:string){

    console.info('Printed the symbol:'+ symbol)
    this.stockSvc.symbol = symbol
    // this.router.navigate(['research']);

    // Create a Promise that resolves when this.stockSvc.symbol has completed
    const symbolPromise = new Promise((resolve) => {
      resolve(this.stockSvc.symbol);
    });

    // Wait for the symbolPromise to resolve before navigating to "research" route
    symbolPromise.then(() => {
      this.router.navigate(['research']);
    });


  }


  removeFromWatchlist(index: number) {
    const symbolToRemove: string = this.stockSvc.symbols[index];
    console.info('To remove symbol: ' + symbolToRemove);
  
    this.stockSvc.removeFromWatchlist(index, this.username)
      .then(() => {
        console.info('Symbol removed successfully');
        return this.stockSvc.getWatchlist(this.username);
      })
      .then((symbol: string[]) => {
        console.info('The updated list of Symbols after removal are:', symbol);
        this.symbols$ = Promise.resolve(symbol);
        return this.stockSvc.getStocklistData(symbol);
      })
      .then((stocks: Stock[]) => {
        this.watchList$ = Promise.resolve(stocks);
      })
      .catch((error) => {
        console.error(error);
      });
  }


  calculateTotalReturn(portfolioData: any[]): number {
    return portfolioData.reduce((total, data) => total + data.total_return, 0);
  }

  calculateTotalPercentageReturn(portfolioData: any[]): number {
    const totalReturn = this.calculateTotalReturn(portfolioData);
    const totalInvestment = portfolioData.reduce((total, data) => total + data.buy_total_price, 0);
    return (totalReturn / totalInvestment) * 100;
  }
  




}
