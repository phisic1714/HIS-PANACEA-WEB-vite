export const config = {
  builder: {
    basic: {
      default: true,

      components: {
        textCustomComp: true,
        radioInputCustomComp: true,
        // textfield: false,
        radio: true,
      },
    },
    advanced: {
      default: false,
    },
    layout: {
      default: false,
    },
    data: {
      default: false,
    },
    premium: {
      default: false,
    },
  },
  editForm: {
    textfield: [
      {
        key: "display",
        components: [
          {
            key: "description",
            ignore: true,
          },
          {
            key: "labelPosition",
            ignore: true,
          },
          {
            key: "tooltip",
            ignore: true,
          },
          {
            key: "prefix",
            ignore: true,
          },
          {
            key: "suffix",
            ignore: true,
          },
          {
            key: "widget.type",
            ignore: true,
          },
          {
            key: "inputMask",
            ignore: true,
          },
          {
            key: "allowMultipleMasks",
            ignore: true,
          },
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "tabindex",
            ignore: true,
          },
          {
            key: "autocomplete",
            ignore: true,
          },
          {
            key: "hidden",
            ignore: true,
          },
          {
            key: "hideLabel",
            ignore: true,
          },
          {
            key: "showWordCount",
            ignore: true,
          },
          {
            key: "showCharCount",
            ignore: true,
          },
          {
            key: "mask",
            ignore: true,
          },
          {
            key: "autofocus",
            ignore: true,
          },
          {
            key: "spellcheck",
            ignore: true,
          },
          {
            key: "disabled",
            ignore: true,
          },
          {
            key: "tableView",
            ignore: true,
          },
          {
            key: "modalEdit",
            ignore: true,
          },
        ],
      },
      {
        key: "validation",
        components: [
          {
            key: "validateOn",
            ignore: true,
          },
          {
            key: "unique",
            ignore: true,
          },
          {
            key: "validate.minLength",
            ignore: true,
          },
          {
            key: "validate.maxLength",
            ignore: true,
          },
          {
            key: "validate.minWords",
            ignore: true,
          },
          {
            key: "validate.minWords",
            ignore: true,
          },
          {
            key: "validate.maxWords",
            ignore: true,
          },
          {
            key: "validate.customMessage",
            ignore: true,
          },
          {
            key: "validate.pattern",
            ignore: true,
          },
          {
            key: "errorLabel",
            ignore: true,
          },
          {
            key: "custom-validation-js",
            ignore: true,
          },
          {
            key: "json-validation-json",
            ignore: true,
          },
        ],
      },
      {
        key: "data",
        ignore: true,
      },
      {
        key: "conditional",
        ignore: true,
      },
      {
        key: "api",
        components: [
          {
            key: "tags",
            ignore: true,
          },
          {
            key: "properties",
            ignore: true,
          },
        ],
      },
      {
        key: "logic",
        ignore: true,
      },
      {
        key: "layout",
        ignore: true,
      },
    ],
  },
};
