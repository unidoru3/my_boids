# boids

データサイエンス実践演習 A 第6回 ── **発展課題 B 用** の clone 練習リポジトリ。

群れの動きを 3 つのシンプルなルールで再現する **Boids シミュレーション** です。
Craig Reynolds が 1987 年に提案したアルゴリズムで、鳥や魚の群れがどう動くかを少数の局所ルールから説明する古典的なモデル。

## ブラウザで開く

```bash
$ explorer.exe index.html   # WSL2
$ open index.html           # Mac
```

環境構築は不要。HTML + CSS + JavaScript だけで動きます。

## 遊び方

画面下のスライダーで 4 つの重みを変えてみてください。

| パラメータ | 効果 |
|---|---|
| **Separation** | 近すぎる仲間から離れる強さ |
| **Alignment** | 仲間の進行方向に揃える強さ |
| **Cohesion** | 仲間の重心に向かう強さ |
| **Mouse Repel** | マウスカーソルから逃げる強さ |

マウスを Canvas に近づけると群れが逃げます。

### 試してみると面白い設定

- Separation = 0 → 全員 1 点に集まる
- Alignment = 3, Cohesion = 3 → 一糸乱れぬ大群行進
- Separation = 3, Cohesion = 0 → バラバラに散らばる
- Mouse Repel = 10 → カーソルで思い通りに追い回せる

## 中身

- `index.html` ── 構造（Canvas + コントロール UI）
- `style.css`  ── 見た目（ダーク系）
- `script.js`  ── 3 ルール + マウス対話 + UI 連動（約 180 行）

## このリポジトリの目的

第 6 回 発展課題 B の clone 練習用です。
clone して、ブラウザで動かして、スライダーで遊んでみてください。
余裕がある人は `script.js` を読んでみると、`computeForces` 関数の中に 3 ルールが書かれています。

## 参考

- Craig W. Reynolds, "Flocks, Herds, and Schools: A Distributed Behavioral Model" (SIGGRAPH 1987)
- Boids について（Reynolds 自身の解説ページ）: https://www.red3d.com/cwr/boids/
