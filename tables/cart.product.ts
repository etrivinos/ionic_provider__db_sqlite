import { Injectable } from '@angular/core';
import { DBProvider } from '../db';

@Injectable()
export class CartProductDBProvider {
	db: any;

  constructor(private dbProvider: DBProvider) {
    this.createScheme();
  }

  /**
  * Create table Scheme
  * @method createScheme
  */
  private createScheme() {
    this.db = this.dbProvider.getDatabase();

    let sql = ['CREATE TABLE IF NOT EXISTS cart_product ( ',
                ' id_product INTEGER NOT NULL, ' +
                ' id_cart INTEGER NOT NULL, ' +
                ' quantity INTEGER NOT NULL, ' +
                ' price INTEGER NOT NULL, ' +
                ' data TEXT NOT NULL, ' +
                ' PRIMARY KEY (id_product, id_cart) ' +
              ')'].join(' ');

    this.db.transaction(function (tx) {
      tx.executeSql(sql);
    });
  }

  /**
  * Insert product to cart
  * @method addProductToCart
  */
  public addProductToCart(cartId, productData) {
    return new Promise((resolve, reject) => {
      this.deleteProductFromCart(cartId, productData.id)
        .then(response => {
          return this.insertProductToCart(cartId, productData);
        })
        .then(response => {
          resolve(true);
        }) 
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
  * Insert product to cart
  * @method insertProductToCart
  */
  private insertProductToCart(cartId, productData) {
    let productId = productData.id;
    let quantity  = productData.quantity;
    let price     = productData.price;

    this.db = this.dbProvider.getDatabase();
    let sql = 'INSERT INTO cart_product(id_cart, id_product, quantity, price, data) ' +
              ' VALUES(?, ?, ?, ?, ?);';
    let data = [ cartId, productId, quantity, price, JSON.stringify(productData) ];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(result) {
            resolve(true);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

  /**
  * Delete product from cart
  * @method deleteProductFromCart
  */
  public deleteProductFromCart(cartId, productId) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'DELETE FROM cart_product WHERE id_cart = ? AND id_product = ?;';
    let data = [ cartId, productId ];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(result) {
            resolve(true);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

  /**
  * Delete all products from cart
  * @method deleteAllProductsFromCart
  */
  public deleteAllProductsFromCart(cartId) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'DELETE FROM cart_product WHERE id_cart = ?;';
    let data = [ cartId ];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(result) {
            resolve(true);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

  /**
  * Get cart info
  * @method getCartInfo
  */
  public getCartInfo(cartId) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'SELECT * FROM cart_product WHERE id_cart = ?;';
    let data = [ cartId ];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(tx, result) {
            let cart = {
              total:  0,
              products:   []
            };

            if(result.rows.length) {
              for(let i = 0; i < result.rows.length; i++) {
                let item = result.rows[i];
                item.data   = JSON.parse(item.data);
                item.total  = item.price * item.quantity;

                cart.total += item.total;
                cart.products.push(item);
              }
            }

            resolve(cart);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

  /**
  * Get product from cart
  * @method getProductFromCart
  */
  public getProductFromCart(cartId, productId) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'SELECT * FROM cart_product WHERE id_cart = ? AND id_product = ?;';
    let data = [ cartId, productId ];

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          data, 
          function(tx, result) {
            let product = {};

            if(result.rows.length) {
              let item  = result.rows[0];
              item.data = JSON.parse(item.data);
              product   = item;
            }

            resolve(product);
          }, 
          function(error) {
            reject(error);
          });
      });
    });
  }

}
