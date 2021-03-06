import * as vscode from "vscode";
import * as fs from "fs";
import * as child from "child_process";
import { isRunning } from "../utils";

class DuraWrapper {
  private _ls: child.ChildProcessWithoutNullStreams | undefined;
  private _config: string;
  constructor(config: string) {
    this._config = config;
  }
  public startDura() {
    this._ls = child.spawn("dura", ["serve"]);
    if (this._ls.exitCode) {
      vscode.window.showErrorMessage("Failed to start dura");
    }
    return this._ls.exitCode;
  }
  public stopDura() {
    if (!this._ls) {
      throw new Error("no process");
    }
    this._ls.kill("SIGINT");
  }
  private async getConfig() {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(this._config, (err, data) => {
        if (err) {
          reject(err);
        }
        if (data) {
          try {
            let json = JSON.parse(data.toString());
            resolve(json);
          } catch (err: any) {
            reject(err);
          }
        }
      });
    });
  }
  public async isWatched(directory: string) {
    try {
      const config = await this.getConfig();
      console.log(config);

      if (!config.repos) {
        throw Error("No repos in config");
      }

      let repos = Object.keys(config.repos);
      if (repos.length < 1) {
        return false;
      }

      if (!repos.includes(directory)) {
        return false;
      } else {
        return true;
      }
    } catch (err: any) {
      console.log(err);
      vscode.window.showErrorMessage(err.message);
    }
  }
  public async watchDir(directory: string) {
    if (process.platform === "win32") {
      child.exec(`cd ${directory} & dura watch`);
    } else {
      console.log(child.exec(`cd ${directory} && dura watch`));
    }
  }
}

export default DuraWrapper;
