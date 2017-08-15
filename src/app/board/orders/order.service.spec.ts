import {
  fakeAsync,
  inject,
  tick,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Http,
  HttpModule
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { Response, ResponseOptions } from '@angular/http';
import { Orders } from './orders.service';

describe('The order service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Orders,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      imports: [
        HttpModule
      ]
    });

  });
  it('will inject', fakeAsync(inject(
      [Orders, MockBackend], (service, mockBackend) => {
      expect(service).toBeDefined();
  })));
  // Interval stuff, I don't know how to test
  xit('will parse response from server', fakeAsync(inject(
      [Orders, MockBackend], (service, mockBackend) => {
          let mockResponse = require('./orders_response.json');
          mockBackend.connections.subscribe( (conn) => {
            conn.mockRespond(new Response(new ResponseOptions({ body: mockResponse })));
          });
          let passed = false;
          service.getOrders(1).subscribe((data) => {
            expect(data.Items).toBeDefined();
            expect(data.Count).toBe(4);
            passed = true;
          }, (error) => {
            throw error;
          }, (complete) => {
            expect(passed).toBeTruthy('No response');
          });
    })));
        // Interval stuff, I don't know how to test
  xit('will return a single result', fakeAsync(inject(
        [Orders, MockBackend], (service, mockBackend) => {
            let mockResponse = require('./orders_response.json');
            mockBackend.connections.subscribe( (conn) => {
              conn.mockRespond(new Response(new ResponseOptions({ body: mockResponse })));
            });
            let passed = false;
            service.getOrder('1326465637890820097').subscribe( (data) => {
              expect(data.Total).toEqual('2494.01');
              passed = true;
            }, (error) => {
              throw error;
            }, (finished) => {
              expect(passed).toBeTruthy('was not run');
            }
          );
    })));
        // Interval stuff, I don't know how to test
  xit('will cache results', fakeAsync(inject(
        [Orders, MockBackend], (service, mockBackend) => {
            let mockResponse = require('./orders_response.json');
            mockBackend.connections.subscribe( (conn) => {
              if (!this.connectionCalledCount) {
                this.connectionCalledCount = 1;
              } else {
                this.connectionCalledCount++;
              }
              conn.mockRespond(new Response(new ResponseOptions({ body: mockResponse })));
            });
            let passed = false;
            service.getOrder('1326465637890820097').subscribe( (data) => {
             expect(this.connectionCalledCount).toEqual(1);
            });
            service.getOrder('1326465637890820097').subscribe( (data) => {
             expect(this.connectionCalledCount).toEqual(1);
            });
    })));

  });
