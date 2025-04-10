import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./RedioTinput.settingsForm";

const RadioInputCustomComp = class extends Component {
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);
  }

  render() {
    return <label className="text"></label>;
  }
};

class RadioInput extends ReactComponent {
  static get builderInfo() {
    return {
      title: "RadioInput",
      icon: "font",
      documentation: "",
      weight: -10,
      schema: RadioInput.schema(),
    };
  }

  static schema() {
    return ReactComponent.schema({
      type: "radioInputCustomComp",
      label: "Text Label",
    });
  }

  static editForm = settingsForm;
  attachReact(element) {
    return ReactDOM.render(
      <RadioInputCustomComp component={this.component} />,
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
  radioInputCustomComp: RadioInput,
};
