import { t } from "ttag";
import type { VisualizationSettings } from "metabase-types/api";
import {
  getDefaultSize,
  getMinSize,
} from "metabase/visualizations/shared/utils/sizes";
import type { VisualizationProperties } from "metabase/visualizations/types";
import Action from "./Action";

const isForm = (object: any, computedSettings: VisualizationSettings) =>
  computedSettings.actionDisplayType === "form";

export const buttonVariantOptions = [
  { name: t`Primary`, value: "primary" },
  { name: t`Outline`, value: "default" },
  { name: t`Danger`, value: "danger" },
  { name: t`Success`, value: "success" },
  { name: t`Borderless`, value: "borderless" },
];

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default Object.assign(Action, {
  uiName: t`Action`,
  identifier: "action",
  iconName: "play",

  noHeader: true,
  supportsSeries: false,
  hidden: true,
  supportPreviewing: false,
  disableSettingsConfig: true,
  canSavePng: false,

  minSize: getMinSize("action"),
  defaultSize: getDefaultSize("action"),

  checkRenderable: () => true,
  isSensible: () => false,

  settings: {
    "card.title": {
      dashboard: false,
    },
    "card.description": {
      dashboard: false,
    },
    actionDisplayType: {
      section: t`Display`,
      title: t`Action Form Display`,
      widget: "radio",
      hidden: true,
      props: {
        options: [
          { name: t`Form`, value: "form" },
          { name: t`Button`, value: "button" },
        ],
      },
    },
    "button.label": {
      section: t`Display`,
      title: t`Label`,
      widget: "input",
      getHidden: isForm,
    },
    "button.variant": {
      section: t`Display`,
      title: t`Variant`,
      widget: "select",
      default: "primary",
      getHidden: isForm,
      props: { options: buttonVariantOptions },
    },
  },
} as VisualizationProperties);
