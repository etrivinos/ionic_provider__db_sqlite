import { Injectable } from '@angular/core';

import { DBProvider } from '../db';
import { CartProductDBProvider } from '../tables/cart.product';

@Injectable()
export class CartDBProvider {
	db: any;

  constructor(
    private dbProvider: DBProvider,
    private cartProductDBProvider: CartProductDBProvider
  ) {
    this.createScheme();
  }

  /**
  * Create table Scheme
  * @method createScheme
  */
  private createScheme() {
    this.db = this.dbProvider.getDatabase();

    let sql = ['CREATE TABLE IF NOT EXISTS cart ( ',
                ' id_cart INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                ' description TEXT NOT NULL ',
              ')'].join(' ');

    this.db.transaction(function (tx) {
      tx.executeSql(sql);
    });

    this.createCart('Default Cart');
  }

  /**
  * Create a cart
  * @method createCart
  */
  public createCart(description) {
    this.db = this.dbProvider.getDatabase();
    let sql = 'INSERT INTO cart(description) VALUES(?);';

    return new Promise((resolve, reject) => {
      this.db.transaction(function (tx) {
        tx.executeSql(
          sql, 
          [ description ], 
          function(tx, result) {
            let sql = 'SELECT * FROM cart ORDER BY id_cart DESC LIMIT 1;';
            tx.executeSql(
              sql, 
              [], 
              function(tx, result) {
                if(result.rows.length) {
                  resolve(result.rows.item(0).id_cart);
                  return;
                }
                reject('There is no cart.');
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
  * Get cart info
  * @method getCartInfo
  */
  public getCartInfo(cartId) {
    return this.cartProductDBProvider.getCartInfo(cartId);
  }

  /**
  * Insert product to cart
  * @method addProductToCart
  */
  public addProductToCart(cartId, productData) {
    return this.cartProductDBProvider.addProductToCart(cartId, productData);
  }

  /**
  * Get product from cart
  * @method getProductFromCart
  */
  public getProductFromCart(cartId, productId) {
    return this.cartProductDBProvider.getProductFromCart(cartId, productId);
  }

  /**
  * Delete product from cart
  * @method deleteProductFromCart
  */
  public deleteProductFromCart(cartId, productId) {
    return this.cartProductDBProvider.deleteProductFromCart(cartId, productId);
  }

  /**
  * Delete all products from cart
  * @method deleteAllProductsFromCart
  */
  public deleteAllProductsFromCart(cartId) {
    return this.cartProductDBProvider.deleteAllProductsFromCart(cartId);
  }

}
