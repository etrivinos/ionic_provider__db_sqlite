import { Injectable } from '@angular/core';

declare var openDatabase;

@Injectable()
export class DBProvider {
	db: any;

  constructor() {}

  /**
  * @method initDatabase
  * @description Init the database
  */
  public getDatabase() {
    if(!this.db) {
      this.db = openDatabase(
        'local_database.db',
        '1',
        'Local Database',
        200 * 1024 * 1024
     	);
    }

    return this.db;
  }
}
