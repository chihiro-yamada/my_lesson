const path = require('path');
const fs = require('fs');
const debug = require('debug')('route');
const matchDebug = debug.extend('match');
const pluralize = require('pluralize');
const express = require('express');

let controllerRoot = path.join(__dirname, '../app/controllers');

class Route {
  // private
  static checkControllerRoot() {
    return fs.existsSync(controllerRoot);
  }

  constructor(router = express.Router({ mergeParams: true })) {
    if (!router) {
      throw new Error('router is required');
    }

    if (!this.constructor.checkControllerRoot()) {
      throw new Error(`Controllerファイルのルートパスが見つかりませんでした。
        setControllerRootで存在するパスを指定してください: ${controllerRoot}`);
    }

    this.router = router;
  }

  sub(...args) {
    const subRoute = new Route();
    this.router.use.apply(this.router, [...args, subRoute.router]);
    return subRoute;
  }

  resource(name, ...args) {
    // TODO: nested resource

    if (name.startsWith('/')) {
      name = name.substr(1, name.length - 1);
    }

    const singlerName = pluralize.singular(name.split('/').pop());

    const last = args.pop();
    let controllerPath;
    let only;
    if (typeof last === 'string') {
      controllerPath = last;
    } else if (typeof last === 'object') {
      controllerPath = last.controller;
      only = last.only;
    }

    if (!controllerPath) {
      throw new Error(`controller が指定されていません: ${JSON.stringify(last)}`);
    }

    const actions = ['create', 'edit', 'show', 'index', 'store', 'update', 'destroy'];
    if (only) {
      const invalidActs = only.filter((act) => { return !actions.includes(act); });
      if (invalidActs.length !== 0) {
        throw new Error(`onlyには ${actions.join(',')} が指定できます。: ${invalidActs.join(',')}`);
      }
    }

    // TODO: 文字連結は本当はしたくないが実装を一貫させることを優先。
    const paramsList = [];
    if (!only || only.includes('create')) {
      paramsList.push(['get', `/${name}/create`, [...args, `${controllerPath}@create`]]);
    }
    if (!only || only.includes('edit')) {
      paramsList.push(['get', `/${name}/:${singlerName}/edit`, [...args, `${controllerPath}@edit`]]);
    }
    if (!only || only.includes('show')) {
      paramsList.push(['get', `/${name}/:${singlerName}`, [...args, `${controllerPath}@show`]]);
    }
    if (!only || only.includes('index')) {
      paramsList.push(['get', `/${name}`, [...args, `${controllerPath}@index`]]);
    }
    if (!only || only.includes('store')) {
      paramsList.push(['post', `/${name}`, [...args, `${controllerPath}@store`]]);
    }
    if (!only || only.includes('update')) {
      paramsList.push(['patch', `/${name}/:${singlerName}`, [...args, `${controllerPath}@update`]]);
      paramsList.push(['put', `/${name}/:${singlerName}`, [...args, `${controllerPath}@update`]]);
    }
    if (!only || only.includes('destroy')) {
      paramsList.push(['delete', `/${name}/:${singlerName}`, [...args, `${controllerPath}@destroy`]]);
    }

    paramsList.forEach((params) => {
      this.match.apply(this, params);
    });
  }

  match(httpMethod, urlPath, middlewares) {
    const routerParams = middlewares.map((middleware) => {
      if (typeof middleware === 'string') {
        const [controllerPath, actionName] = middleware.split('@');
        if (!actionName) {
          throw new Error(`actionのフォーマットはクラスファイル名@メソッド名です。「@」が入っていません: ${middleware}`);
        }

        const actionProcess = this.getActionProcess(controllerPath, actionName);

        const fullName = `${controllerPath}@${actionName}`;
        const processWrapper = {
          [fullName]: async (req, res, next) => {
            matchDebug(`${req.method} ${req.path} ${fullName}`);
            try {
              return await actionProcess(req, res);
            } catch (err) {
              console.error(err.message);
              console.error(err.stack);
              next(err);
            }
          }
        }[fullName]; // for function with name
        return processWrapper;
      } else {
        return middleware;
      }
    });

    if (debug.enabled) {
      const displayParams = routerParams.map(param => {
        return param.name ? param.name : param.toString();
      });
      debug(`${httpMethod} ${urlPath} ${JSON.stringify(displayParams)}`);
    }

    this.router[httpMethod].apply(this.router, [urlPath, ...routerParams]);
    return this;
  }

  // private
  getActionProcess(controllerPath, actionName) {
    const Controller = this.loadController(controllerPath, actionName);

    if (!Controller.getProcess) {
      throw new Error(`${controllerPath}にgetProcess関数がありません。基底のControllerを継承していない可能性があります`);
    }
    return Controller.getProcess(actionName, controllerPath);
  }

  // private
  loadController(controllerPath) {
    return this.requireController(path.join(controllerRoot, `${controllerPath}.js`));
  }

  // private
  requireController(controllerFullPath) {
    if (!fs.existsSync(controllerFullPath)) {
      throw new Error(`Controllerファイルが見つかりませんでした: ${controllerFullPath}`);
    }
    return require(controllerFullPath);
  }
}

for (const httpMethod of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
  Route.prototype[httpMethod] = function (urlPath, ...paramsList) {
    return this.match(httpMethod, urlPath, paramsList);
  };
}

function setControllerRoot(root) {
  controllerRoot = root;
}

class BaseController {
  static getProcess(actionName, controllerPath) {
    if (!this.prototype[actionName]) {
      throw new Error(`${controllerPath}に指定のactionがありません: ${actionName}`);
    }

    const fullName = `${controllerPath}@${actionName}`;

    const actionCaller = {
      [fullName]: async (req, res, _next) => {
        const controller = new this();
        await controller[actionName](req, res);
      }
    }[fullName]; // for function with name

    return actionCaller;
  }
}

module.exports = { Route, setControllerRoot, BaseController };