import { Injectable } from '@angular/core';
import { DBProvider } from '../db';

@Injectable()
export class OrderDBProvider {
	db: any;

  constructor(
    private dbProvider: DBProvider
  ) {
    this.createScheme();
  }

  /**
  * Create table Scheme
  * @method createScheme
  */
  private createScheme() {
    console.log('createScheme order');

    this.db = this.dbProvider.getDatabase();

    let sql = ['CREATE TABLE IF NOT EXISTS cart_order ( ',
                ' id_order INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                ' data TEXT NOT NULL ',
              ')'].join(' ');

    this.db.transaction(function (tx) {
      tx.executeSql(sql, [], 
        function(tx, result) {},
        function(error) {});
    });
  }

  /**
  * Create a order
  * @method createOrder
  */
  public createOrder(data) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'INSERT INTO cart_order (data) VALUES(?);';

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          [ JSON.stringify(data) ], 
          function(tx, result) {
            let sql = 'SELECT * FROM cart_order ORDER BY id_order DESC LIMIT 1;';
            tx.executeSql(
              sql, 
              [], 
              function(tx, result) {
                if(result.rows.length) {
                  let row = result.rows[0];
                  row.data = JSON.parse(row.data);

                  resolve(result.rows[0]);
                  return;
                }
                reject('There is no order.');
              }, 
              function(error) {
                reject(error);
              });
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

  /**
  * Get order info
  * @method getOrderInfo
  */
  public getOrderInfo(orderId) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'SELECT * FROM cart_order WHERE id_order = ?;';
    let data = [ orderId ];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(tx, result) {
            resolve(result);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

  /**
  * Get all orders
  * @method getAllOrders
  */
  public getAllOrders() {
    this.db = this.dbProvider.getDatabase();
    let sql = 'SELECT * FROM cart_order ORDER BY id_order DESC;';
    let data = [];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(tx, result) {
            let orders = [];

            if(result.rows.length) {
              for(let i = 0; i < result.rows.length; i++) {
                let row = result.rows[i];
                row.data = JSON.parse(row.data);
                orders.push(row);
              }
            }

            resolve(orders);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

}
