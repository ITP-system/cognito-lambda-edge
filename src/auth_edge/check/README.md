# check

## 仕様

- Cognito で認証したユーザーであるか判定する

  - JWT id トークンが有効か判定する
  - JTW id トークンが無効な場合リフレッシュトークンで再発行する

- Cognito で認証したユーザーでない場合にログイン画面にリダイレクトする
  (ログイン画面にリダイレクトするときに Cognito に関するクッキーを削除する)
