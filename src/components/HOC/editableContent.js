import React from "react";
import { editableCharLimit } from "../../utils/constants";
import "./editableContent.css";
export default function contentEditable(WrappedComponent) {
  return class extends React.Component {
    state = {
      editing: false,
    };

    toggleEdit = (e) => {
      e.stopPropagation();
      if (this.state.editing) {
        this.cancel();
      } else {
        this.edit();
      }
    };

    edit = () => {
      this.setState(
        {
          editing: true,
          previousValue: this.domElm.textContent,
        },
        () => {
          var strLength = this.domElm.textContent.length;
          this.domElm.focus();

          var range = document.createRange();
          var sel = window.getSelection();
          range.setStart(this.domElm.childNodes[0], strLength);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      );
    };

    save = () => {
      this.setState(
        {
          editing: false,
        },
        () => {
          if (!this.domElm.textContent) {
            this.domElm.textContent = this.state.previousValue;
          } else if (this.props.onSave && this.isValueChanged()) {
            this.props.onSave(this.domElm.textContent);
          }
        }
      );
    };

    cancel = () => {
      this.domElm.textContent = this.state.previousValue;
      this.setState({
        editing: false,
      });
    };

    isValueChanged = () => {
      return this.props.value !== this.domElm.textContent;
    };

    handleKeyDown = (e) => {
      const { key } = e;

      switch (key) {
        case "Enter":
          this.save();
          break;
        case "Escape":
          this.cancel();
          break;
        default:
          try {
            if (this.domElm.textContent.length > editableCharLimit) {
              this.domElm.textContent = this.domElm.textContent.substring(
                0,
                editableCharLimit - 1
              );
            }
          } catch (e) {
            console.log(e);
          }
      }
    };

    render() {
      let editOnClick = true;
      const { editing } = this.state;
      if (this.props.editOnClick !== undefined) {
        editOnClick = this.props.editOnClick;
      }
      return (
        <WrappedComponent
          className={`editable-element ${editing || ""}`}
          onClick={editOnClick ? this.toggleEdit : undefined}
          contentEditable={editing}
          ref={(domNode) => {
            this.domElm = domNode;
          }}
          onBlur={this.save}
          onKeyDown={this.handleKeyDown}
          suppressContentEditableWarning={
            this.props.suppressContentEditableWarning
          }
        >
          {this.props.value}
        </WrappedComponent>
      );
    }
  };
}
