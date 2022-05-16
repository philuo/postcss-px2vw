# px2vw

升级了 `postcss-px-to-viewport`, 对您有用的话可 [add Star](https://github.com/philuo/postcss-px2vw), thks~

## 简介

- `支持postcss@8.x`

- `可以将你CSS中的px单位转化为vw，1vw等于1/100视口宽度。`

### 输入

```css
.class {
  margin: -10px .5vh;
  padding: 5vmin 9.5px 1px;
  border: 3px solid black;
  border-bottom-width: 1px;
  font-size: 14px;
  line-height: 20px;
}

.class2 {
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 20px;
  line-height: 30px;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

### 输出
```css
.class {
  margin: -3.125vw .5vh;
  padding: 5vmin 2.96875vw 1px;
  border: 0.9375vw solid black;
  border-bottom-width: 1px;
  font-size: 4.375vw;
  line-height: 6.25vw;
}

.class2 {
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 6.25vw;
  line-height: 9.375vw;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

## 上手

### 安装

使用npm安装

```
$ npm install @yuo/postcss-px2vw -D
```

或者使用yarn进行安装

```
$ yarn add @yuo/postcss-px2vw -D
```

### 配合Vite使用

- Vite内置了postcss, [参考文档](https://cn.vitejs.dev/config/#css-postcss)

```ts
// vite.config.ts
import { defineConfig } from 'vite';

// plugins
import px2vw from '@yuo/postcss-px2vw';

export default defineConfig(() => {
  css: {
    postcss: {
      px2vw({
        // 配置参数
      })
    }
  }
});

```

### 配置参数

默认参数:
```js
{
  unitToConvert: 'px',
  viewportWidth: 320,
  unitPrecision: 5,
  propList: ['*'],
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  selectorBlackList: [],
  minPixelValue: 1,
  mediaQuery: false,
  replace: true,
  exclude: [],
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568
}
```
- `unitToConvert` (String) 需要转换的单位，默认为"px"
- `viewportWidth` (Number) 设计稿的视口宽度
- `unitPrecision` (Number) 单位转换后保留的精度
- `propList` (Array) 能转化为vw的属性列表
  - 传入特定的CSS属性；
  - 可以传入通配符"*"去匹配所有属性，例如：['*']；
  - 在属性的前或后添加"*",可以匹配特定的属性. (例如['*position*'] 会匹配 background-position-y)
  - 在特定属性前加 "!"，将不转换该属性的单位 . 例如: ['*', '!letter-spacing']，将不转换letter-spacing
  - "!" 和 "*"可以组合使用， 例如: ['*', '!font*']，将不转换font-size以及font-weight等属性
- `viewportUnit` (String) 希望使用的视口单位
- `fontViewportUnit` (String) 字体使用的视口单位
- `selectorBlackList` (Array) 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
    - 如果传入的值为字符串的话，只要选择器中含有传入值就会被匹配
        - 例如 `selectorBlackList` 为 `['body']` 的话， 那么 `.body-class` 就会被忽略
    - 如果传入的值为正则表达式的话，那么就会依据CSS选择器是否匹配该正则
        - 例如 `selectorBlackList` 为 `[/^body$/]` , 那么 `body` 会被忽略，而 `.body` 不会
- `minPixelValue` (Number) 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
- `mediaQuery` (Boolean) 媒体查询里的单位是否需要转换单位
- `replace` (Boolean) 是否直接更换属性值，而不添加备用属性
- `exclude` (Array or Regexp) 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
    - 如果值是一个正则表达式，那么匹配这个正则的文件会被忽略
    - 如果传入的值是一个数组，那么数组里的值必须为正则
- `landscape` (Boolean) 是否添加根据 `landscapeWidth` 生成的媒体查询条件 `@media (orientation: landscape)`
- `landscapeUnit` (String) 横屏时使用的单位
- `landscapeWidth` (Number) 横屏时使用的视口宽度

## 许可

本项目使用 [MIT License](LICENSE).

## 项目来源

* https://github.com/evrone/postcss-px-to-viewport 启发有了这个项目
