'use babel';

import AtomWeexDevtoolView from './atom-weex-devtool-view';
import { CompositeDisposable } from 'atom';

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
      'atom-weex-devtool:toggle': () => this.toggle()
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
    console.log('AtomWeexDevtool was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
