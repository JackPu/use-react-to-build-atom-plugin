'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import AtomPluginTestView from './atom-plugin-test-view';
import { CompositeDisposable } from 'atom';
import Dialog from '../components/dialog';

let atomPanel;

export default {

  atomPluginTestView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomPluginTestView = new AtomPluginTestView(state.atomPluginTestViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomPluginTestView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-plugin-test:toggle': () => this.toggle(),
      'atom-plugin-test:repeat': () => this.repeat()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomPluginTestView.destroy();
  },

  serialize() {
    return {
      atomPluginTestViewState: this.atomPluginTestView.serialize()
    };
  },

  toggle() {
    console.log('this is a new plugin');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  repeat() {
    this._openDialog({
      message: 'Enter your key word:',
      initialValue: '',
      onConfirm: (str) => {
        this._confirm(str);
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

  _confirm(str) {
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

};
