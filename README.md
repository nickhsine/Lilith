# Lilith

### Monorepo setup
This is a monorepo containing sub-packages:
- [@mirrormedia/lilith-draft-renderer](./packages/draft-renderer): see `packages/draft-renderer`
- [@mirrormedia/lilith-draft-editor](./packages/draft-editor): see `packages/draft-editor`
- [@mirrormedia/lilith-core](./packages/core): see `packages/core`
- [@mirrormedia/lilith-editools](./packages/editools): see `packages/editools`
- [@mirrormedia/lilith-mesh](./packages/mesh): see `packages/mesh`
- [@mirrormedia/lilith-mirrormedia](./packages/mirrormedia): see `packages/mirrormedia`
- [@mirrormedia/lilith-readr](./packages/readr): see `packages/readr`
- [@mirrormedia/lilith-openrelationship](./packages/openrelationship): see `packages/openrelationship`

This monorepo adopts `husky`, `lint-staged` and `yarn workspaces`. 
`husky` and `lint-staged` will 
1. run eslint for needed sub-packages before `git commit`

`yarn workspaces` will install dependencies of all the sub-packages wisely and effienciently.

### Development
Before modifying sub-packages' source codes, make sure you install dependencies on root. 
We need `husky` and `lint-staged` installed first.

### Installation
`yarn install`

### Troubleshootings
#### Q1: 我在 root 資料夾底下跑 `yarn install` 時，在 `yarn postinstall` 階段發生錯誤。

A1: 如果錯誤訊息與 `@mirrormedia/lilith-core` 有關，可嘗試以下步驟來解決

1. 在 `packages/draft-renderer` 底下執行 `yarn build`
2. 在 `packages/draft-editor` 底下執行 `yarn build`
3. 在 `packages/core` 底下執行 `yarn build`
4. 在 root 底下執行 `yarn install`

確保 local 端有 `@mirrormedia-/lilith-core` 相關的檔案可以讓其他 package 載入。


