# これはなんですか？
WebのMVCフレームワークを学習する為の、Express + Sequelize で構築したのBoilerplateです。
一般的なフレームワークが持っている機能を組み込んであります。

独自の内容としてLaravelライクなクラス形式のControllerを利用できるようにしているので、このBoilerplateで学習することによりMVCフレームワーク全般の基礎知識が得られることが目的です。

# 準備
以下の環境を推奨します。

- Node.js 14.17.0 （.node-version に記載）
- npm 8系
- PostgreSQL 11系

# インストールから起動まで
ボイラープレートとして利用するので、cloneしてから `.git` ディレクトリを削除して本リポジトリから切り離してください。必要ならその後自分のgitリポジトリとして新たに`git init`すると良いでしょう。

例えば `team_todo` という名前でプロジェクトを作成する場合には以下のような流れになります。

```
$ git clone git@github.com:CircleAround/express-mvc-boilerplate.git team_todo
$ cd team_todo
$ rm -rf .git
```

`.env.sample` ファイルを`.env`という名前でコピーします。

```
$ cp .env.sample .env
```

DBの設定については、macOSの環境の場合には全て未入力でも動作するでしょう。他の環境では`DB_USERNAME`、`DB_PASS`を明示的に入れる必要があるかもしれません。その他の`DB_*`の変数については未入力であればデフォルトの値で動作します。詳細は `config/database.js`を確認してください。

```
$ npm install
$ npm run db:reset
$ npm run dev
```

http://localhost:8000 へアクセスして画面が出れば成功です。


# dotenv（環境変数）
`.env` という名前のファイルを修正することで環境変数を変えることができます。
`.env.sample` というファイルがデフォルトで用意してあるので、`.env.sample` を　`.env` という名前でコピーすると良いでしょう。以降環境変数に関する設定は、`.env` に記載してください。

# 初期ユーザー
最初から用意されている開発環境用のユーザは以下です。詳しくは `database/seeders/xxx-demo-users.js`（xxxは数字の羅列）を確認してください。

|  username  |  password  | role | 備考 |
| ---- | ---- | ---- | ---- |
|  admin  |  password  | admin | ユーザー管理ができる管理者ユーザー |
|  user1  |  password  | normal | 一般ユーザー |
|  user2  |  password  | normal | 一般ユーザー |

# コマンド
以下のようなカスタムnpmコマンドが準備されています。

## npm run dev
開発用サーバーを立ち上げます。ソースコードを編集すると自動で再起動されます。

## npm run console
いわゆるREPLです。

```
$ npm run console
[ログが出た後エンターキーを押してください]

> .exit # 終了します
```

グローバル変数に models という名前でSequelizeのモデルがロードされます。

```
> await models.User.findOne()[エンター]
```

のようにすると、Userモデルを使って検索を行うなどできます。

## npm run db:reset
開発用のDBが全削除されて再構築され、初期データを入れるseedが実行されます。

## npm test
テストを動かします

## npm run lint
eslintのチェックでコーディング規約チェックがされます

## npm start
本番用の起動コマンドです

# 基本的な動く実装を確認したい場合

ユーザーのデータを操作するパスとして管理者ユーザー専用に http://localhost:8000/admin/users を用意しています。基本的なCRUDの動作をここで確認できるので、実装時の参考にしたり、ここからコードをコピぺして動作を確認するなど利用してください。

# ソースコードの構造

一般的なWEB MVCフレームワークに近づけて以下の構造にしています。app/controllers はLaravelライクに書けるような準備がされています（後述）。

- app
    - controllers — コントローラー
    - middlewares — ミドルウェア
    - models — Sequelizeのモデル
- bin — 各種コマンドが入っている
- config — 設定
    - locales — i18n用のファイル
    - database.js DB設定
- database — DB用
    - migrations — Sequelizeのマイグレーションファイル
    - seeders — Sequelizeのシードファイル
- lib — 共有ライブラリ
- public — 公開ディレクトリ
- routes — Expressのルーツ
- tests — テスト
- views — Expressのview

# Sequelize（Model）

Sequelizeの基本に則ってやる想定です。自動生成でクラス記法のModelファイルの雛形が出来上がるので、クラスを扱うイメージです。ここでは網羅的な内容は提供していませんが、適宜Sequelizeのことを調べながら利用してください。以下、いくつかのポイントや、本ボイラープレートでの決まり事を記します。

## Migration

https://sequelize.org/v6/manual/migrations.html

ModelファイルとMigrationファイルの雛形を作るにはコマンドを使って自動生成するとはやいです。

    $ npx sequelize-cli model:generate --name User --attributes username:string,email:string,displayName:string

あくまで作成されるのは雛形ですが、下記のコマンドでDBへ変更を適用することができます。必要であれば雛形を修正してから下記コマンドを利用してDBへ反映します。

    $ npm run db:migrate

必要に応じてバリデーションやアソシエーションを修正する必要があります。
例えばModelの内容にバリデーションの設定を入れるなどして、以下のような形を作って仕上げていきます。

https://github.com/CircleAround/express-mvc-boilerplate/blob/2832dcae508ed3d32533293b39d9a74e2e2f69ba/app/models/user.js#L61-L112


## Validation

https://sequelize.org/v6/manual/validations-and-constraints.html#validators

バリデーションエラー発生時には例外が送出されます。その例外を捕まえて、renderで次の画面を出す形を推奨しています。

```js
  // POST /
  async store(req, res) {
    try {
      const user = await models.User.register(req.body);
      await req.flash('info', `新規ユーザー「${user.username}」を作成しました`);
      res.redirect('/admin/users/');
    } catch (err) {
      if (err instanceof ValidationError) {
        // models.User.registerの処理中にバリデーションエラーが起きるとここのコードに処理が移ります。
        // renderで次の画面を表示してエラーをユーザに知らせます。
        res.render('admin/users/create', { user: req.body, err });
      } else {
        throw err;
      }
    }
  }
```

https://github.com/CircleAround/express-mvc-boilerplate/blob/v2.0/app/controllers/admin/users_controller.js#L18-L31

エラー時の処理はフレームワークで差異があるので今後の学習時の参考にしてください。

- Railsの基本的な書き方の場合にはエラー時に例外を送出せず、モデルのインスタンスがエラー状態を保持していたり、メソッドの戻り値で成否を表します（ https://railsguides.jp/active_record_validations.html ）。
- Laravelではバリデーションエラーした際にredirectで画面遷移する仕組みが用意されています（ https://laravel.com/docs/validation ）。


## Seed

seedの雛形を作るにはコマンドを利用すると良いでしょう。

    npx sequelize-cli seed:generate --name demo-user

作成された雛形を修正してデータを作成します。下記は初期に用意されている、ユーザのseed情報です。

https://github.com/CircleAround/express-mvc-boilerplate/blob/v2.0/database/seeders/20210421062808-demo-user.js



## Mass Assignment脆弱性への対応

https://sequelize.org/v6/manual/model-instances.html#saving-only-some-fields

Sequelizeの機能で、save時に保存されるプロパティをfieldで指定することで行えます。下記はnameカラムだけが更新されます。

```js
    await jane.save({ fields: ['name'] });
```

## Association

https://sequelize.org/v6/manual/assocs.html

例としてUserモデルとPostモデルがuserIdを介してhasManyでアソシエーションしているケースを考えます。下記のPRにあるコードが実際に動作するサンプルです。

[CircleAround/express-mvc-boilerplate#4](https://github.com/CircleAround/express-mvc-boilerplate/pull/4)

### belongsTo
Postのassociateメソッドで以下のようにbelongsToを定義します。

```js
      class Post extends Model {
        static associate(models) {
          this.User = this.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
          });
        }
        ...（省略)...
```

asで指定した名前（小文字始まりの camelCaseを推奨します）を使って、以下のように関連している情報を取得できます。

```js
    // postインスタンスの情報を利用してDBアクセスし、user情報を取得する
    const user = await post.getUser(); // get + [asに入れた名前] でcamelCaseにします。
```

また、複数検索の際にincludeに名前を指定すると、一回で関連する情報も検索してきます。

```js
    // includesに指定するのはasで決めた名前です
    const posts = await models.Post.findAll({ include: 'user' });
    
    posts.forEach((post) => {
      debug(post.title);
      debug(post.user.displayName); //ここでは検索は発生させずにuser情報が取得できます
    });
```

### hasMany
Userのassociateメソッドでは以下のようにhasManyを定義します。

```js
      class User extends Model {
        static associate(models) {
          this.Posts = this.hasMany(models.Post, {
            foreignKey: 'userId',
            as: 'posts'
          });
        }
        ...（省略）...
```

このasで指定した名前（小文字始まりの camelCaseを推奨します）に沿って作られる関数を使うと、以下のように関連している情報を取得できます。

以下の2つはほぼ同じ意味合いになります。

```js
    const posts = await user.getPosts(); // get + [asで決めた名前] でcamelCaseにします。
```

```js
    // これはアソシエーションを使わなかった場合の実装
    const posts = await models.Post.findAll({ where: { userId: user.id } } )
```

アソシエーションする際、Migration時に外部キー制約を入れるのを推奨します。例えば Postsテーブルの作成時にuserIdに対してUsersテーブルのidへ外部キー制約を入れる場合には下記のように `references` を使用します。

```js
    module.exports = {
      up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Posts', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          userId: {
            allowNull: false,     
            type: Sequelize.INTEGER,
            references: { model: 'Users', key: 'id' } // これを指定することで、外部キー制約を行えます
          },
    
          ...省略....
        });
      },
      down: async (queryInterface, _Sequelize) => {
        await queryInterface.dropTable('Posts');
      }
    };
```

### belongsToMany
多対多のアソシエーションで、中間テーブルを介してデータを取得したい場合にはbelongsToManyを利用します。PostとUserがLikeという中間テーブルで繋がっているケースでは以下のようにします。

likedUsersは「あるPostをLikeしたユーザーたち」を指すアソシエーションになります。

```js
      class Post extends Model {
        static associate(models) {
          this.Like = this.hasMany(models.Like, {
            foreignKey: 'postId',
            as: 'like'
          });
          this.LikedUsers = this.belongsToMany(models.User, {
            through: 'Like',
            foreignKey: 'postId',
            otherKey: 'userId',
            as: 'likedUsers'
          });
        }
      }
```

準備を済ませれば以下のようにして、postのインスタンスからLikeしたユーザーの集合を取り出すことができます。

```js
    const likedUsers = await post.getLikedUsers();
    likedUsers.forEach((likedUser) => {
      debug(likedUser.displayName);
    });
```

# Routes / Controller

Laravelとイメージを合わせていますが、仕様が不自然になるところはExpressの機能を利用する形になっています。


## 最低限の使い方

ExpressのRouterを内部に保持しているRouteクラスを用意してあります。

```js
    const { Route } = require('../lib/route');
    const route = new Route();
    
    // Expressと同様の関数スタイルが指定できます
    route.get('/', function (req, res, _next) {
      res.render('index', { title: 'Express', user: req.user });
    });
    
    route.router // Expressのrouterが取得できます
```

## クラス経由でのアクションの呼び出し

コントローラクラスのメソッド呼び出しに対応しています。Laravelライクな `[コントローラファイル名]@[アクション名]` を利用するスタイルです。HTTPメソッドそれぞれを指定するスタイルでは以下のように書けます。間にMiddlewareを挟むとExpress同様に適用されます（今回はforceLoginというMiddlewareを適用）。

```js
    route.get('/user/edit', forceLogin, 'users_controller@edit');
    route.put('/user', forceLogin, 'users_controller@update');
```

この場合以下のような指定になります。

| HTTPメソッド | URIパス      | コントローラーパス                         | アクション  |
| -------- | ---------- | --------------------------------- | ------ |
| GET      | /user/edit | /app/controllers/users_controller | edit   |
| PUT      | /user      | /app/controllers/users_controller | update |

`/app/controllers/users_controller` のeditメソッドを例えば以下のように実装します。

```js
    const Controller = require('./controller'); // コントローラーの基底クラス
    
    class UsersController extends Controller {
      edit(req, res) { // req res は express同様のリクエスト、レスポンスのオブジェクトです。
        const user = req.user; // 本ボイラープレートではログインユーザーをreq.userで取得できます
        res.render('users/edit', { user }); // "/views/users/edit.pug" を探して適用します
      }
    }
    
    // module.exports でクラスを返してください。
    module.exports = UsersController;
```

## リソース指定

一覧や更新、削除などの一般的な呼び出しを一気に作成できるリソース指定の記述に対応しています。（Laravelのresource-controllerの設定を模擬した指定です）

```js
    route.resource('examples', 'examples_controller');
``` 

参考: https://laravel.com/docs/6.x/controllers#resource-controllers

この指定で以下のような7つのアクションが一気に定義されます。

| HTTPメソッド  | URIパス                   | コントローラパス                             | アクション   |
| --------- | ----------------------- | ------------------------------------ | ------- |
| GET       | /examples               | /app/controllers/examples_controller | index   |
| GET       | /examples/create        | /app/controllers/examples_controller | create  |
| POST      | /examples               | /app/controllers/examples_controller | store   |
| GET       | /examples/:example      | /app/controllers/examples_controller | show    |
| GET       | /examples/:example/edit | /app/controllers/examples_controller | edit    |
| PUT/PATCH | /examples/:example      | /app/controllers/examples_controller | update  |
| DELETE    | /examples/:example      | /app/controllers/examples_controller | destroy |

## 指定のアクションだけ適用する

もしも全てのアクションが必要でない場合には以下のようにオブジェクト指定をしてonlyで設定します。

```js
    route.resource('edamples', { controller: 'examples_controller', only: ['index', 'store', 'destroy'] });
```

この指定で以下のような3つのアクションが一度に定義されます。

| HTTPメソッド | URIパス              | コントローラパス                             | アクション   |
| -------- | ------------------ | ------------------------------------ | ------- |
| GET      | /examples          | /app/controllers/examples_controller | index   |
| POST     | /examples          | /app/controllers/examples_controller | store   |
| DELETE   | /examples/:example | /app/controllers/examples_controller | destroy |

## 子Route

Route#sub メソッドを使って、子供にあたるRouteを作成できます。

```js
    // /adminのURL階層の作成。ログインチェックが有効。
    const adminRoute = route.sub('/admin', forceLogin);
    adminRoute.get('/test', 'users_controller@edit');
```

この場合以下のような指定になります。

| HTTPメソッド | URIパス           | コントローラーパス                         | アクション |
| -------- | --------------- | --------------------------------- | ----- |
| GET      | **/admin**/test | /app/controllers/users_controller | edit  |

子Routeの指定時にプレースホルダも指定できます。


## コントローラーパスの階層

`/`で区切りを入れるとコントローラを探すパスに階層を作れます。

```js
    route.get('/user/edit', 'example/users_controller@edit');
```

この場合以下のような指定になります。

| HTTPメソッド | URIパス      | コントローラーパス                                     | アクション |
| -------- | ---------- | --------------------------------------------- | ----- |
| GET      | /user/edit | /app/controllers/**example**/users_controller | edit  |



# Pug（View）

formの一般的な作り方は以下です。method-overrideやcsrfトークンをつけるところはショートカット記法が用意されています。

> _method put

form で送信するmethodをput扱いにします。

> _csrf

csrfトークンをhiddenで埋め込みます。

```pug
      form(action=`/user`, method="post")
        _method put
        _csrf
        
        - if(errors)
          ul.errors
            each error in errors
              li= error.message
        div
          input(name="displayName", value!=user.displayName)
        div
          input(type="submit")
```

常にViewで使えるグローバル変数として以下があります

- csrfToken: csrfトークンの中身が入っている変数
- flashMessages: フラッシュメッセージの中身が入っている変数


リンクでdeleteメソッドなどを利用する場合には例えば以下のように、_methodと_csrfをリクエストパラメータとして明示的に指定します。

```pug
    a(href=`/admin/users/${user.id}?_method=delete&_csrf=${csrfToken}`) 削除
```


# i18n
https://github.com/mashpie/i18n-node


config/locales以下のファイルで日本語、英語のロケール設定ができます。

config/locales/ja.json

```js
    {
      "AppTitle": "ExpressMVC",
      "views": {
        "Profile": "プロフィール"
      }
    }
```

View内で利用するときには以下のように使います。

```pug
    a(href="/")= __('AppTitle')

    h2= __('views.Profile')
```


# flashメッセージ
```js
    await req.flash('info', '更新しました');
```

次に表示するビューで「更新しました」とのメッセージが画面上部に出ます。

```js
    await req.flash('error', 'エラーです');
```

次に表示するビューで「エラーです」とのメッセージが画面上部に出ます。
