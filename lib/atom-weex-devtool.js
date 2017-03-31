'use babel';

import AtomWeexDevtoolView from './atom-weex-devtool-view';
import { CompositeDisposable } from 'atom';
import request from 'request';

export default {

  atomWeexDevtoolView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomWeexDevtoolView = new AtomWeexDevtoolView(state.atomWeexDevtoolViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomWeexDevtoolView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-weex-devtool:toggle': () => this.toggle(),
      'atom-weex-devtool:fetch': () => this.fetch(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomWeexDevtoolView.destroy();
  },

  serialize() {
    return {
      atomWeexDevtoolViewState: this.atomWeexDevtoolView.serialize()
    };
  },

  toggle() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      let reversed = selection.split('').reverse().join('')
      editor.insertText(reversed);
    }
  },

  fetch() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      this.download(selection).then((html) => {
        editor.insertText(html)
      }).catch((error) => {
        atom.notifications.addWarning(error.reason)
      })
    }
  },

  download(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: 'Unable to download page'
          })
        }
      })
    })
  }

};
