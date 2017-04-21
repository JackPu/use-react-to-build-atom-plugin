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
