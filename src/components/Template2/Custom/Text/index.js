import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./Text.settingsForm";

const TextCustomComp = class extends Component {
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);
  }

  render() {
    return <label class="text"></label>;
  }
};

class Text extends ReactComponent {
  static get builderInfo() {
    return {
      title: "Text",
      icon: "font",
      documentation: "",
      weight: -10,
      schema: Text.schema(),
    };
  }

  static schema() {
    return ReactComponent.schema({
      type: "textCustomComp",
      label: "Text Label",
    });
  }

  static editForm = settingsForm;
  attachReact(element) {
    return ReactDOM.render(
      <TextCustomComp component={this.component} />,
      element
    );
  }

  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }
}

export default {
  textCustomComp: Text,
};
