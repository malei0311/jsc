# jsc
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmalei0311%2Fjsc.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmalei0311%2Fjsc?ref=badge_shield)


使用 [project-references][project-references] 分隔代码，加速编译。

## 开发

### 前置条件

请先安装 [git-lfs](https://git-lfs.com/)，否则无法下载编译产物。

### 装包

```bash
# 如果支持 workspace 能力，直接
npm install
# 即可

# 否则
npm install
lerna bootstrap
```

### 发包

```bash
# 先 build
npm run build
# 然后跑测试
npm run test
# 然后 pub, 方便 web 版本的接入, 升级版本号要慎重
npm run pub
```

### 测试

```bash
npm run test
npm run coverage
```

## 其他

```bash
// 项目中排除掉 build 出来的 js, 只有一些配置文件是 js 格式的，所以 eslint/prettier 只针对非 js
find . -name 'node_modules' -prune -o -type f -name "*.js" -print
```

<!-- references -->
[project-references]: https://www.typescriptlang.org/docs/handbook/project-references.html


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmalei0311%2Fjsc.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmalei0311%2Fjsc?ref=badge_large)