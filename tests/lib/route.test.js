const { Route, BaseController, setControllerRoot } = require('../../lib/route');
const express = require('express');

Route.checkControllerRoot = () => {
  return true;
};
setControllerRoot('@/app/controllers');

class ExampleController {
  execute() { }
}

test('should call [controller]@[action]', () => {
  const getProcess = jest.fn(() => { });
  getProcess.mockReturnValueOnce(() => { });
  ExampleController.getProcess = getProcess;

  const routerGet = jest.fn(() => { });
  const router = express.Router();
  router.get = routerGet;

  const requireController = jest.fn(() => { });
  requireController.mockReturnValueOnce(ExampleController);
  const route = new Route(router);
  route.requireController = requireController;

  route.get('/test/action', 'example_controller@execute');

  expect(routerGet.mock.calls).toHaveLength(1);
  expect(routerGet.mock.calls[0][0]).toBe('/test/action');
  expect(routerGet.mock.calls[0][1].name).toBe('example_controller@execute');

  expect(requireController.mock.calls).toHaveLength(1);
  expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/example_controller.js');

  expect(getProcess.mock.calls).toHaveLength(1);
  expect(getProcess.mock.calls[0][0]).toBe('execute');
});

test('should call [controller]@[action] with middleware', () => {
  const getProcess = jest.fn(() => { });
  const actionCaller = () => { };
  getProcess.mockReturnValueOnce(actionCaller);
  ExampleController.getProcess = getProcess;

  const routerGet = jest.fn(() => { });
  const router = express.Router();
  router.get = routerGet;

  const middleware = jest.fn(() => { });

  const requireController = jest.fn(() => { });
  requireController.mockReturnValueOnce(ExampleController);
  const route = new Route(router);
  route.requireController = requireController;

  route.get('/test/action', middleware, 'example_controller@execute');

  expect(routerGet.mock.calls).toHaveLength(1);
  expect(routerGet.mock.calls[0][0]).toBe('/test/action');
  expect(routerGet.mock.calls[0][1]).toBe(middleware);
  expect(routerGet.mock.calls[0][2].name).toBe('example_controller@execute');

  expect(requireController.mock.calls).toHaveLength(1);
  expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/example_controller.js');

  expect(getProcess.mock.calls).toHaveLength(1);
  expect(getProcess.mock.calls[0][0]).toBe('execute');
});

test('should call [dir]/[controller]@[action]', () => {
  const getProcess = jest.fn(() => { });
  const actionCaller = () => { };
  getProcess.mockReturnValueOnce(actionCaller);
  ExampleController.getProcess = getProcess;

  const routerGet = jest.fn(() => { });
  const router = express.Router();
  router.get = routerGet;

  const requireController = jest.fn(() => { });
  requireController.mockReturnValueOnce(ExampleController);
  const route = new Route(router);
  route.requireController = requireController;

  route.get('/test/action', 'admin/example_controller@execute');

  expect(routerGet.mock.calls).toHaveLength(1);
  expect(routerGet.mock.calls[0][0]).toBe('/test/action');
  expect(routerGet.mock.calls[0][1].name).toBe('admin/example_controller@execute');

  expect(requireController.mock.calls).toHaveLength(1);
  expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/admin/example_controller.js');

  expect(getProcess.mock.calls).toHaveLength(1);
  expect(getProcess.mock.calls[0][0]).toBe('execute');
});

describe('#resource', () => {
  class ResourcesController {
    index(_req, _res) {
    }

    create(_req, _res) {
    }

    store(_req, _res) {
    }

    show(_req, _res) {
    }

    edit(_req, _res) {
    }

    update(_req, _res) {
    }

    destroy(_req, _res) {
    }
  }

  test('should call resource actions', () => {
    const getProcess = jest.fn(() => { });
    getProcess.mockReturnValue(() => { });
    ResourcesController.getProcess = getProcess;

    const routerGet = jest.fn(() => { });
    const routerPost = jest.fn(() => { });
    const routerPut = jest.fn(() => { });
    const routerPatch = jest.fn(() => { });
    const routerDelete = jest.fn(() => { });
    const router = express.Router();
    router.get = routerGet;
    router.post = routerPost;
    router.put = routerPut;
    router.patch = routerPatch;
    router.delete = routerDelete;

    const requireController = jest.fn(() => { });
    requireController.mockReturnValue(ResourcesController);
    const route = new Route(router);
    route.requireController = requireController;

    route.resource('resources', 'resources_controller');

    expect(routerGet.mock.calls).toHaveLength(4);
    expect(routerGet.mock.calls[0][0]).toBe('/resources/create');
    expect(routerGet.mock.calls[0][1].name).toBe('resources_controller@create');
    expect(routerGet.mock.calls[1][0]).toBe('/resources/:resource/edit');
    expect(routerGet.mock.calls[1][1].name).toBe('resources_controller@edit');
    expect(routerGet.mock.calls[2][0]).toBe('/resources/:resource');
    expect(routerGet.mock.calls[2][1].name).toBe('resources_controller@show');
    expect(routerGet.mock.calls[3][0]).toBe('/resources');
    expect(routerGet.mock.calls[3][1].name).toBe('resources_controller@index');

    expect(routerPost.mock.calls).toHaveLength(1);
    expect(routerPost.mock.calls[0][0]).toBe('/resources');
    expect(routerPost.mock.calls[0][1].name).toBe('resources_controller@store');

    expect(routerPut.mock.calls).toHaveLength(1);
    expect(routerPut.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerPut.mock.calls[0][1].name).toBe('resources_controller@update');

    expect(routerPatch.mock.calls).toHaveLength(1);
    expect(routerPatch.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerPatch.mock.calls[0][1].name).toBe('resources_controller@update');

    expect(routerDelete.mock.calls).toHaveLength(1);
    expect(routerDelete.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerDelete.mock.calls[0][1].name).toBe('resources_controller@destroy');

    expect(requireController.mock.calls).toHaveLength(8);
    expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/resources_controller.js');

    expect(getProcess.mock.calls).toHaveLength(8);
    expect(getProcess.mock.calls[0][0]).toBe('create');
    expect(getProcess.mock.calls[1][0]).toBe('edit');
    expect(getProcess.mock.calls[2][0]).toBe('show');
    expect(getProcess.mock.calls[3][0]).toBe('index');
    expect(getProcess.mock.calls[4][0]).toBe('store');
    expect(getProcess.mock.calls[5][0]).toBe('update');
    expect(getProcess.mock.calls[6][0]).toBe('update');
    expect(getProcess.mock.calls[7][0]).toBe('destroy');
  });

  test('should call [/dir]/[resource] actions', () => {
    const getProcess = jest.fn(() => { });
    getProcess.mockReturnValue(() => { });
    ResourcesController.getProcess = getProcess;

    const routerGet = jest.fn(() => { });
    const routerPost = jest.fn(() => { });
    const routerPut = jest.fn(() => { });
    const routerPatch = jest.fn(() => { });
    const routerDelete = jest.fn(() => { });
    const router = express.Router();
    router.get = routerGet;
    router.post = routerPost;
    router.put = routerPut;
    router.patch = routerPatch;
    router.delete = routerDelete;

    const requireController = jest.fn(() => { });
    requireController.mockReturnValue(ResourcesController);
    const route = new Route(router);
    route.requireController = requireController;

    route.resource('test/resources', 'resources_controller');

    expect(routerGet.mock.calls).toHaveLength(4);
    expect(routerGet.mock.calls[0][0]).toBe('/test/resources/create');
    expect(routerGet.mock.calls[0][1].name).toBe('resources_controller@create');
    expect(routerGet.mock.calls[1][0]).toBe('/test/resources/:resource/edit');
    expect(routerGet.mock.calls[1][1].name).toBe('resources_controller@edit');
    expect(routerGet.mock.calls[2][0]).toBe('/test/resources/:resource');
    expect(routerGet.mock.calls[2][1].name).toBe('resources_controller@show');
    expect(routerGet.mock.calls[3][0]).toBe('/test/resources');
    expect(routerGet.mock.calls[3][1].name).toBe('resources_controller@index');

    expect(routerPost.mock.calls).toHaveLength(1);
    expect(routerPost.mock.calls[0][0]).toBe('/test/resources');
    expect(routerPost.mock.calls[0][1].name).toBe('resources_controller@store');

    expect(routerPut.mock.calls).toHaveLength(1);
    expect(routerPut.mock.calls[0][0]).toBe('/test/resources/:resource');
    expect(routerPut.mock.calls[0][1].name).toBe('resources_controller@update');

    expect(routerPatch.mock.calls).toHaveLength(1);
    expect(routerPatch.mock.calls[0][0]).toBe('/test/resources/:resource');
    expect(routerPatch.mock.calls[0][1].name).toBe('resources_controller@update');

    expect(routerDelete.mock.calls).toHaveLength(1);
    expect(routerDelete.mock.calls[0][0]).toBe('/test/resources/:resource');
    expect(routerDelete.mock.calls[0][1].name).toBe('resources_controller@destroy');

    expect(requireController.mock.calls).toHaveLength(8);
    expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/resources_controller.js');

    expect(getProcess.mock.calls).toHaveLength(8);
    expect(getProcess.mock.calls[0][0]).toBe('create');
    expect(getProcess.mock.calls[1][0]).toBe('edit');
    expect(getProcess.mock.calls[2][0]).toBe('show');
    expect(getProcess.mock.calls[3][0]).toBe('index');
    expect(getProcess.mock.calls[4][0]).toBe('store');
    expect(getProcess.mock.calls[5][0]).toBe('update');
    expect(getProcess.mock.calls[6][0]).toBe('update');
    expect(getProcess.mock.calls[7][0]).toBe('destroy');
  });

  test('should call resource actions with dir/controller', () => {
    const getProcess = jest.fn(() => { });
    getProcess.mockReturnValue(() => { });
    ResourcesController.getProcess = getProcess;

    const routerGet = jest.fn(() => { });
    const routerPost = jest.fn(() => { });
    const routerPut = jest.fn(() => { });
    const routerPatch = jest.fn(() => { });
    const routerDelete = jest.fn(() => { });
    const router = express.Router();
    router.get = routerGet;
    router.post = routerPost;
    router.put = routerPut;
    router.patch = routerPatch;
    router.delete = routerDelete;

    const requireController = jest.fn(() => { });
    requireController.mockReturnValue(ResourcesController);
    const route = new Route(router);
    route.requireController = requireController;

    route.resource('resources', 'test/resources_controller');

    expect(routerGet.mock.calls).toHaveLength(4);
    expect(routerGet.mock.calls[0][0]).toBe('/resources/create');
    expect(routerGet.mock.calls[0][1].name).toBe('test/resources_controller@create');
    expect(routerGet.mock.calls[1][0]).toBe('/resources/:resource/edit');
    expect(routerGet.mock.calls[1][1].name).toBe('test/resources_controller@edit');
    expect(routerGet.mock.calls[2][0]).toBe('/resources/:resource');
    expect(routerGet.mock.calls[2][1].name).toBe('test/resources_controller@show');
    expect(routerGet.mock.calls[3][0]).toBe('/resources');
    expect(routerGet.mock.calls[3][1].name).toBe('test/resources_controller@index');

    expect(routerPost.mock.calls).toHaveLength(1);
    expect(routerPost.mock.calls[0][0]).toBe('/resources');
    expect(routerPost.mock.calls[0][1].name).toBe('test/resources_controller@store');

    expect(routerPut.mock.calls).toHaveLength(1);
    expect(routerPut.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerPut.mock.calls[0][1].name).toBe('test/resources_controller@update');

    expect(routerPatch.mock.calls).toHaveLength(1);
    expect(routerPatch.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerPatch.mock.calls[0][1].name).toBe('test/resources_controller@update');

    expect(routerDelete.mock.calls).toHaveLength(1);
    expect(routerDelete.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerDelete.mock.calls[0][1].name).toBe('test/resources_controller@destroy');

    expect(requireController.mock.calls).toHaveLength(8);
    expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/test/resources_controller.js');

    expect(getProcess.mock.calls).toHaveLength(8);
    expect(getProcess.mock.calls[0][0]).toBe('create');
    expect(getProcess.mock.calls[1][0]).toBe('edit');
    expect(getProcess.mock.calls[2][0]).toBe('show');
    expect(getProcess.mock.calls[3][0]).toBe('index');
    expect(getProcess.mock.calls[4][0]).toBe('store');
    expect(getProcess.mock.calls[5][0]).toBe('update');
    expect(getProcess.mock.calls[6][0]).toBe('update');
    expect(getProcess.mock.calls[7][0]).toBe('destroy');
  });

  test('should call resource only actions', () => {
    const getProcess = jest.fn(() => { });
    getProcess.mockReturnValue(() => { });
    ResourcesController.getProcess = getProcess;

    const routerGet = jest.fn(() => { });
    const routerPost = jest.fn(() => { });
    const routerPut = jest.fn(() => { });
    const routerPatch = jest.fn(() => { });
    const routerDelete = jest.fn(() => { });
    const router = express.Router();
    router.get = routerGet;
    router.post = routerPost;
    router.put = routerPut;
    router.patch = routerPatch;
    router.delete = routerDelete;

    const requireController = jest.fn(() => { });
    requireController.mockReturnValue(ResourcesController);
    const route = new Route(router);
    route.requireController = requireController;

    route.resource('resources', { controller: 'resources_controller', only: ['index', 'destroy'] });

    expect(routerGet.mock.calls).toHaveLength(1);
    expect(routerGet.mock.calls[0][0]).toBe('/resources');
    expect(routerGet.mock.calls[0][1].name).toBe('resources_controller@index');

    expect(routerPost.mock.calls).toHaveLength(0);
    expect(routerPut.mock.calls).toHaveLength(0);
    expect(routerPatch.mock.calls).toHaveLength(0);

    expect(routerDelete.mock.calls).toHaveLength(1);
    expect(routerDelete.mock.calls[0][0]).toBe('/resources/:resource');
    expect(routerDelete.mock.calls[0][1].name).toBe('resources_controller@destroy');

    expect(requireController.mock.calls).toHaveLength(2);
    expect(requireController.mock.calls[0][0]).toBe('@/app/controllers/resources_controller.js');

    expect(getProcess.mock.calls).toHaveLength(2);
    expect(getProcess.mock.calls[0][0]).toBe('index');
    expect(getProcess.mock.calls[1][0]).toBe('destroy');
  });
});

test('Controller not have getProcess', () => {
  class DummyController {
    execute() { }
  }

  const requireController = jest.fn(() => { });
  requireController.mockReturnValueOnce(DummyController);
  const route = new Route();
  route.requireController = requireController;

  expect(() => route.get('/test/action', 'example_controller@execute')).toThrow(
    "example_controllerにgetProcess関数がありません。基底のControllerを継承していない可能性があります"
  );
});

describe('errors', () => {
  test('Controller not have action', () => {
    class DummyController extends BaseController {
      // no actions
    }

    const requireController = jest.fn(() => { });
    requireController.mockReturnValueOnce(DummyController);
    const route = new Route();
    route.requireController = requireController;

    expect(() => route.get('/test/action', 'example_controller@execute')).toThrow(
      `example_controllerに指定のactionがありません: execute`
    );
  });

  test('Controller file not found', () => {
    const route = new Route();
    expect(() => route.get('/test/action', 'example_controller@execute')).toThrow(
      `Controllerファイルが見つかりませんでした: @/app/controllers/example_controller.js`
    );
  });

  test('Unexpected controller@action format', () => {
    class DummyController {
      execute() { }
    }

    const requireController = jest.fn(() => { });
    requireController.mockReturnValueOnce(DummyController);
    const route = new Route();
    route.requireController = requireController;

    expect(() => route.get('/test/action', 'example_controller#execute')).toThrow(
      "actionのフォーマットはクラスファイル名@メソッド名です。「@」が入っていません: example_controller#execute"
    );
  });

  test('cannot parse controllerPath', () => {
    class DummyController extends BaseController {
      index() { }
    }

    const requireController = jest.fn(() => { });
    requireController.mockReturnValue(DummyController);
    const route = new Route();
    route.requireController = requireController;

    expect(() => route.resource('resources', { only: ['index'] })).toThrow(
      'controller が指定されていません: {"only":["index"]}'
    );
  });

  test('only invalid actions', () => {
    class DummyController extends BaseController {
      index() { }
      destroy() { }
    }

    const requireController = jest.fn(() => { });
    requireController.mockReturnValue(DummyController);
    const route = new Route();
    route.requireController = requireController;

    expect(() => route.resource('resources', { controller: 'example_controller', only: ['index', 'delete', 'test'] })).toThrow(
      'onlyには create,edit,show,index,store,update,destroy が指定できます。: delete,test'
    );
  });
});

