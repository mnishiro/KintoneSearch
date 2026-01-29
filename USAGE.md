# 使い方

## ZIP の作成

以下のスクリプトを実行すると、プラグイン登録用の ZIP を作成できます。

```bash
./scripts/build-zip.sh
```

実行後、リポジトリ直下に `kintone-partial-search-plugin.zip` が生成されます。

## kintone へのアップロード手順（概要）

1. kintone に管理者としてログインします。
2. 「kintone システム管理」→「プラグイン」を開きます。
3. 「読み込む」から `kintone-partial-search-plugin.zip` をアップロードします。
4. 対象アプリの設定画面でプラグインを追加・有効化します。
5. プラグイン設定で検索対象フィールドを選択して保存します。
6. アプリの設定を更新して反映します。
