# 使用 React 开发 Atom 插件

### 使用 React  开发 Atom 插件

Atom 是目前非常流行的编辑器，除了好用小巧的特点，它丰富的插件也给开发者提供了很多的便利性。

Atom 是基于 [Electron](https://electron.atom.io/) 开发的，也就是说我们可以通过写 HTML + CSS + JavaScript 的方式来构建我们的桌面应用。而一个典型的Electron App 的架构如图:
<img src="https://gtms04.alicdn.com/tfs/TB1stZiQFXXXXXEXVXXXXXXXXXX-1650-1275.png" />

其实我们在完成实际的插件的部分，也就是工作的最上层，使用我们前端最基本的知识去实现基本的需求。当然这一层的实现，可以有很多方式，你可以使用简单的JS 去创建视图窗口，你也可以使用一些框架，比如 Vue.js 以及今天提及的 [React](https://facebook.github.io/react/)。React 最核心的一个目标:
> A JAVASCRIPT LIBRARY FOR BUILDING USER INTERFACES

React 的发展很迅速，现在不仅可以完成普通网站的开发，也能能够开发原生的App([React-Native](http://facebook.github.io/react-native/))，也可以开发 VR 相关的内容 ([React-VR](https://facebook.github.io/react-vr/)), 当然桌面应用现在也是可以借助于 Electron 完成。
今天我们简单实现一个插件，通过菜单按钮，呼出对话框，然后完成输入字符串，并将字符串插入到我们的当前代码中。

### 创建项目

首先我们创建一个基本的插件包，打开 Atom 然后通过 `Package Generator` 提供的命令来创建一个基本的文件结构。我们通过快捷键 `Cmd+shift+P` 或者 `Ctrl+shift+P` 输入 `"Package Generator"` ，输入你的项目名称(我的暂时叫atom-plugin-test)，然后进入项目目录，可以看到一个基本的结构:

``` bash
+ keymaps // 存放快捷键配置
+ lib   // 主要业务的实现
+ menus // 设置菜单的配置
+ spec  // 添加测试
+ styles // 存放样式的目录
  .gitignore
  package.json
  RADEME.md
```

我们可以按照自己的需求修改 `pacakge.json` 和 `README.md`。至于其他目录下面的内容，我们后面会提及到。

默认的插件包生成后，我们可以看到菜单栏的 `Packages` 里面的选项里有我们刚刚创建的插件包的选项。

### 安装依赖

首先我们先安装 我们插件环境所需要的一些依赖:

``` bash
npm install --save react-dom react rxjs redux classnames
```

其中有些类库 `redux`  `rxjs` 等根据你个人的使用情况安装。

当然你也可以安装开始时候需要的一些诸如打包，语法检查和测试的一些依赖诸如  `eslint` `flow-bin` `webpack`等，这也完全取决于你个人的需求。

### 熟悉基本的Atom 插件开发

如果你之前没有开发过 Atom 插件，你可以阅读官方的 [Building your first Atom plugin](https://github.com/blog/2231-building-your-first-atom-plugin) , 官方会比较详细的介绍开发插件的一个基本流程。当然后文也会在开发的过程中强调这些基本的概念。

首先我们进入 `lib/atom-plugin-test.js` 里面(不同的项目名称，自然lib下的文件名称也不一样)，它就是每个插件包的入口文件，每个插件包都需要指定这样的入口文件。我们先试着在 `toggle` 里面简单修改一行代码，来体验下修改的效果。
我们选择 `View` -> `Developer` -> `Toggle Developers Tool` 打开调试器，查看插件的输出。
每次修改完后代码，我们都需要重启编辑器，你可以 选择菜单栏 `View` -> `Developers` -> `Reload Window` 来实现，你也可以调用  `Cmd+shift+P` 或者 `Ctrl+shift+P` 输入 Window 然后选中 `reload` 命令来执行。

``` javascript
// ...
toggle() {
    console.log('This is a new plugin');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

```
这个时候我们可以选择 `Packages` -> `atom-plugin-test` -> `toggle` 查看输出。

如果你想修改按钮的名称，这个时候你可以去 `menus`目录下的 `atom-plugin-test.json`进行修改，其中 `context-menu` 表示鼠标右键的菜单选项，而 menu 则是菜单栏的按钮选项。如果我们留心 我们的入口文件的话，我们可以看到这段代码:

``` javascript
// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-plugin-test:toggle': () => this.toggle()
    }));
```
我们执行的每个命令 比如 `atom-plugin-test:toggle` 都需要将它添加到我们的工作空间，这样我们才能够通过快捷键或者按钮调用它。如果找不到这些命令，则什么也不会执行。


### 添加基本的组件

既然使用 `React` ，我们需要添加基本的组件，我们创建一个目录，`components`，这个目录下则存放我们所有的业务组件。

#### 创建对话框界面

我们在componnets 首先创建input.js ，它表示一个基本的输入框。

```
'use babel';
// input component
import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { CompositeDisposable } from 'atom';


class Input extends React.Component {
  constructor(props) {
    super(props);
    const value = props.initialValue ? props.initialValue: '';
    this.state = {
      value
    };
  }

  componentDidMount() {
    const disposable = this._disposable = new CompositeDisposable();
    const textEditor = this.getTextEditor();
    const inputEle = this.getInputElement();
    this.setVal(this.state.value);
    disposable.add(textEditor.onDidChange(() => {
      this.setState({
        value: textEditor.getText()
      });
      this.props.onDidChange.call(null, textEditor.getText());
    }));

  }

  render() {
    const className = classNames(this.props.className, {
      'atom-text-editor-unstyled': this.props.unstyled,
      [`atom-text-editor-${this.props.size}`]: (this.props.size != null),
    });
    return (
      <atom-text-editor
        class={className}
        mini
      />
    );
  }

  setVal(val) {
    this.getTextEditor().setText(val);
  }

  getVal() {
    return this.state.value;
  }

  getTextEditor() {
    return this.getInputElement().getModel();
  }

  getInputElement() {
    return ReactDOM.findDOMNode(this);
  }

  onDidChange(callback) {
    return this.getTextEditor().onDidChange(callback);
  }

}

Input.defaultProps = {
  onDidChange: function() {},
  value: ''
};
export default Input;

```

我们简单说下里面的逻辑，在 Atom 里面，如果使用一个输入框的我们需要用 `atom-text-editor` 来表示，这里面我们可以获取到它的文本内容并且设置它的值。

接下来我们创建弹窗的组件 `dialog.js`

``` javascript
'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import { CompositeDisposable } from 'atom';
import AtomInput from './input';

class Dialog extends React.Component {
  constructor(props) {
    super(props);
    this._disposable = new CompositeDisposable();
    this._confirm = this._confirm.bind(this);
    this._close = this._close.bind(this);
    this._handleDocumentMouseDown = this._handleDocumentMouseDown.bind(this);
  }

  componentDidMount() {
    const input = this.refs.input;
    this._disposable.add(atom.commands.add(
      ReactDOM.findDOMNode(input),
      {
        'core:confirm': () => {
          this._confirm();
        },
        'core:close': () => {
          this._close();
        },
      }
    ));
    document.addEventListener('mousedown', this._handleDocumentMouseDown)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this._handleDocumentMouseDown);
  }

  _handleDocumentMouseDown(event) {
    const dialog = this.refs.dialog;
    if (!dialog) {
      this._close();
    }
    if (event.target !== dialog && !dialog.contains(event.target)) {
      this._close();
    }
  }

  _confirm() {
    this.props.onConfirm(this.refs.input.getVal());
    this._close();
  }

  _close() {
    if (!this._isClosed) {
      this._isClosed = true;
      this.props.onClose();
    }
  }

  render() {
    return (
      <div className="tree-view-dialog" ref="dialog">
        <label>{this.props.message}</label>
        <AtomInput
         initialValue={this.props.initialValue}
         ref="input"
        />
      </div>
    );
  }


}

Dialog.defaultProps = {
  onConfirm: function() {},
  onClose: function() {},
  message: 'Create a Weex Project in the path:',
};

Dialog.propType = {
  onConfirm: React.PropTypes.function,
  onClose: React.PropTypes.function,
  message: React.PropTypes.string,
};

export default Dialog;

```

我们会渲染一个简单的弹窗，它有一段提示的文本和引入的输入框组件构成，我们可以设置组件显示的文本内容和设置输入框的初始值。

#### 打开对话框

接下来我们回到 `lib/atom-plugin-test.js`,这时候我们需要调用刚刚完成的组件。
首先我们添加依赖的模块
``` javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from '../components/dialog';
```

接下来我们添加一个命令:
``` javascript
// Register command that toggles this view
  this.subscriptions.add(atom.commands.add('atom-workspace', {
    'atom-plugin-test:toggle': () => this.toggle(),
    'atom-plugin-test:repeat': () => this.repeat()
  }));
```

实现 repeat 方法:

``` javascript
repeat() {
  this._openDialog({
    message: 'Enter your key word:',
    initialValue: '',
    onConfirm: (str) => {
      this._confrim(str);
    },
    onClose: () => {
      this._closeDialog();
    },
  });
},

_openDialog(props) {
  this._closeDialog();
  const dialogEle = document.createElement('div');
  atomPanel = atom.workspace.addModalPanel({item: dialogEle});
  dialogComponent = ReactDOM.render(
    <Dialog {...props} />,
    dialogEle,
  );
},

_confrim(str) {
  if (editor = atom.workspace.getActiveTextEditor()) {
    editor.insertText(str + str)
  } else {
    atom.notifications.addError(`Error: Cannot Insert string`);
  }
},

_closeDialog() {
  if (atomPanel != null) {
    if (dialogComponent != null) {
      ReactDOM.unmountComponentAtNode(atomPanel.getItem());
      dialogComponent = null;
    }
    atomPanel.destroy();
    atomPanel = null;
  }
}

```
[完整的代码](https://github.com/JackPu/use-react-to-build-atom-plugin/blob/master/lib/atom-plugin-test.js)

完成基本的逻辑后，我们在 menus 下的菜单添加一个新的菜单选项:

``` bash
"submenu": [
  {
    "label": "Toggle",
    "command": "atom-plugin-test:toggle"
  },
  {
    "label": "Repeat",
    "command": "atom-plugin-test:repeat"
  }
]
```
这个时候我们刷新下，就可以看见菜单栏上多出的菜单选项。演示效果如下:

<img src="http://img1.vued.vanthink.cn/vuedad5c4c04846264e883c315d27a266456.gif" />

[完整参考代码](https://github.com/JackPu/use-react-to-build-atom-plugin)


### 参考

+ [Building your first Atom plugin](https://github.com/blog/2231-building-your-first-atom-plugin)

+ [Atom 插件开发知识整理](http://www.jackpu.com/atom-cha-jian-kai-fa-zhi-shi-zheng-li-chi-xu-geng-xin/)

+ [TextEditor API](https://atom.io/docs/api/v1.16.0/TextEditor#instance-onDidRemoveCursor)

+ [Nuclide]




----------
