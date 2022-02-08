import BetterSqlite3, { Database } from "better-sqlite3";
import { EngineDatabase, EngineDBOptions } from "../database";
import { utcUnixEpoch } from "./helpers";
import { CopyWithPartial, PartialExcept } from "./types";

interface EngineModelInterface {
  id: number;
}

const transforms = [
  {
    test: (value: any) => value instanceof Date,
    transform: (value: Date) => utcUnixEpoch(value),
  },
];

export abstract class EngineModel<T extends EngineModelInterface> {
  edb: EngineDatabase;
  db: Database;
  options: EngineDBOptions;
  abstract tableName: string;

  constructor(edb: EngineDatabase, options: EngineDBOptions) {
    this.edb = edb;
    this.db = edb.db;
    this.options = options;
  }

  create(data: CopyWithPartial<T, "id">): T {
    for (var k in data) {
      const v = data[k];
      for (var i = 0; i < transforms.length; i++) {
        const transform = transforms[i];
        if (transform.test(v)) {
          data[k] = transform.transform(v);
        }
      }
    }
    console.log(data);
    const statement = this.db.prepare(
      `INSERT INTO ${this.tableName}(${Object.keys(data).join(
        ","
      )}) VALUES (${Object.keys(data)
        .map((k) => `@${k}`)
        .join(",")})`
    );
    statement.run(data);
    const lastInsertId = this.db.prepare("SELECT last_insert_rowid()").get()[
      "last_insert_rowid()"
    ];
    const insertedData = this.db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ${lastInsertId}`)
      .get();
    return insertedData;
  }

  getAll(): Array<T> {
    const rows = <Array<T>>(
      this.db.prepare(`SELECT * FROM ${this.tableName}`).all()
    );
    return rows;
  }

  getAllWhere(statement: string, ...values: any): Array<T> {
    const rows = <Array<T>>(
      this.db
        .prepare(`SELECT * FROM ${this.tableName} WHERE ${statement}`)
        .all(...values)
    );
    return rows;
  }

  getOneByID(id: number): T {
    console.log(this.db);
    const row = this.db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(id);
    return row;
  }

  update(data: T): T {
    const statement = this.db.prepare(
      `UPDATE ${this.tableName} SET ${Object.keys(data)
        .map((k) => `${k} = @${k}`)
        .join(",")} WHERE id = @id`
    );
    statement.run(data);
    const lastInsertId = this.db.prepare("SELECT last_insert_rowid()").get()[
      "last_insert_rowid()"
    ];
    const insertedData = this.db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ${lastInsertId}`)
      .get();
    return insertedData;
  }

  delete(data: PartialExcept<T, "id">): void {
    const statement = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE id = @id`
    );
    statement.run(data);
  }
}
