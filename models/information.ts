import { EngineInformation } from "../types";
import { EngineModel } from "./model";
import semver from "semver";

const TESTED_ENGINE_DB_VERSION = "~2.18";

export class EngineInformationModel extends EngineModel<EngineInformation> {
  tableName: string = "Information";

  checkVersion() {
    const info = this.getAll()[0];
    const version = `${info.schemaVersionMajor}.${info.schemaVersionMinor}.${info.schemaVersionPatch}`;
    if (!semver.satisfies(version, TESTED_ENGINE_DB_VERSION)) {
      const errorMessage = `The database version is ${version}. This version of the library has only been tested with version ${TESTED_ENGINE_DB_VERSION}.`;
      console.warn(errorMessage);
      if (!this.options.ignoreVersionErrors) {
        throw new Error(errorMessage);
      }
    }
  }

  getDatabaseUuid(): string {
    const info = this.getAll()[0];
    return info.uuid;
  }
}
