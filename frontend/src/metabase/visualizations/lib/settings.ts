import { getIn } from "icepick";

import _ from "underscore";
import ChartSettingInput from "metabase/visualizations/components/settings/ChartSettingInput";
import ChartSettingInputGroup from "metabase/visualizations/components/settings/ChartSettingInputGroup";
import { ChartSettingInputNumeric } from "metabase/visualizations/components/settings/ChartSettingInputNumeric";
import ChartSettingRadio from "metabase/visualizations/components/settings/ChartSettingRadio";
import ChartSettingSelect from "metabase/visualizations/components/settings/ChartSettingSelect";
import ChartSettingToggle from "metabase/visualizations/components/settings/ChartSettingToggle";
import ChartSettingSegmentedControl from "metabase/visualizations/components/settings/ChartSettingSegmentedControl";
import ChartSettingFieldPicker from "metabase/visualizations/components/settings/ChartSettingFieldPicker";
import ChartSettingFieldsPicker from "metabase/visualizations/components/settings/ChartSettingFieldsPicker";
import ChartSettingFieldsPartition from "metabase/visualizations/components/settings/ChartSettingFieldsPartition";
import { ChartSettingColorPicker } from "metabase/visualizations/components/settings/ChartSettingColorPicker";
import ChartSettingColorsPicker from "metabase/visualizations/components/settings/ChartSettingColorsPicker";

import * as MetabaseAnalytics from "metabase/lib/analytics";
import type {
  VisualizationSettingDefinition,
  VisualizationSettingsDefinitions,
} from "metabase/visualizations/types";
import type { VisualizationSettings } from "metabase-types/api";
import type Question from "metabase-lib/Question";

const WIDGETS = {
  input: ChartSettingInput,
  inputGroup: ChartSettingInputGroup,
  number: ChartSettingInputNumeric,
  radio: ChartSettingRadio,
  select: ChartSettingSelect,
  toggle: ChartSettingToggle,
  segmentedControl: ChartSettingSegmentedControl,
  field: ChartSettingFieldPicker,
  fields: ChartSettingFieldsPicker,
  fieldsPartition: ChartSettingFieldsPartition,
  color: ChartSettingColorPicker,
  colors: ChartSettingColorsPicker,
};

type SettingWidget<TObject> = Omit<
  VisualizationSettingDefinition<TObject, unknown>,
  "widget"
> & {
  id: string;
  value: any;
  set: boolean;
  widget: any;
  onChange: any;
  onChangeSettings: (
    newSettings: VisualizationSettings,
    question: Question,
  ) => void;
};

export function getComputedSettings(
  settingsDefs: VisualizationSettingsDefinitions,
  object: unknown,
  storedSettings: VisualizationSettings,
  extra = {},
) {
  const computedSettings = {};
  for (const settingId in settingsDefs) {
    getComputedSetting(
      computedSettings,
      settingsDefs,
      settingId as keyof VisualizationSettings,
      object,
      storedSettings,
      extra,
    );
  }
  return computedSettings;
}

function getComputedSetting(
  computedSettings: VisualizationSettings, // MUTATED!
  settingsDefs: VisualizationSettingsDefinitions,
  settingId: keyof VisualizationSettings,
  object: unknown,
  storedSettings: VisualizationSettings,
  extra = {},
) {
  if (settingId in computedSettings) {
    return;
  }

  const settingDef = settingsDefs[settingId] || {};

  for (const dependentId of settingDef.readDependencies || []) {
    getComputedSetting(
      computedSettings,
      settingsDefs,
      dependentId,
      object,
      storedSettings,
      extra,
    );
  }

  if (settingDef.useRawSeries && object._raw) {
    object = object._raw;
  }

  const settings = { ...storedSettings, ...computedSettings };

  try {
    if (settingDef.getValue) {
      return (computedSettings[settingId] = settingDef.getValue(
        object,
        settings,
        extra,
      ));
    }

    if (storedSettings[settingId] !== undefined) {
      if (!settingDef.isValid || settingDef.isValid(object, settings, extra)) {
        return (computedSettings[settingId] = storedSettings[settingId]);
      }
    }

    if (settingDef.getDefault) {
      const defaultValue = settingDef.getDefault(object, settings, extra);

      return (computedSettings[settingId] = defaultValue);
    }

    if ("default" in settingDef) {
      return (computedSettings[settingId] = settingDef.default);
    }
  } catch (e) {
    console.warn("Error getting setting", settingId, e);
  }
  return (computedSettings[settingId] = undefined);
}

function getSettingWidget(
  settingsDefs: VisualizationSettingsDefinitions,
  settingId: keyof VisualizationSettings,
  storedSettings: VisualizationSettingsDefinitions,
  computedSettings: VisualizationSettingsDefinitions,
  object: unknown,
  onChangeSettings: SettingWidget["onChangeSettings"],
  extra = {},
): SettingWidget {
  const settingDef = settingsDefs[settingId] as VisualizationSettingDefinition<
    any,
    any
  >;
  const value = computedSettings[settingId];
  const onChange = (value, question) => {
    const newSettings = { [settingId]: value };
    for (const settingId of settingDef.writeDependencies || []) {
      newSettings[settingId] = computedSettings[settingId];
    }
    for (const settingId of settingDef.eraseDependencies || []) {
      newSettings[settingId] = null;
    }
    onChangeSettings(newSettings, question);
    settingDef.onUpdate?.(value, extra);
  };
  if (settingDef.useRawSeries && object._raw) {
    extra.transformedSeries = object;
    object = object._raw;
  }
  return {
    ...settingDef,
    id: settingId,
    value: value,
    section: settingDef.getSection
      ? settingDef.getSection(object, computedSettings, extra)
      : settingDef.section,
    title: settingDef.getTitle
      ? settingDef.getTitle(object, computedSettings, extra)
      : settingDef.title,
    hidden: settingDef.getHidden
      ? settingDef.getHidden(object, computedSettings, extra)
      : settingDef.hidden || false,
    marginBottom: settingDef.getMarginBottom
      ? settingDef.getMarginBottom(object, computedSettings, extra)
      : settingDef.marginBottom,
    disabled: settingDef.getDisabled
      ? settingDef.getDisabled(object, computedSettings, extra)
      : settingDef.disabled || false,
    props: {
      ...(settingDef.props ? settingDef.props : {}),
      ...(settingDef.getProps
        ? settingDef.getProps(object, computedSettings, onChange, extra)
        : {}),
    },
    set: settingId in storedSettings,
    widget:
      typeof settingDef.widget === "string"
        ? WIDGETS[settingDef.widget]
        : settingDef.widget,
    onChange,
    onChangeSettings, // this gives a widget access to update other settings
  };
}

export function getSettingsWidgets(
  settingsDefs: VisualizationSettingsDefinitions,
  storedSettings: VisualizationSettings,
  computedSettings: VisualizationSettings,
  object: SettingObject,
  onChangeSettings,
  extra = {},
) {
  return Object.keys(settingsDefs)
    .map(settingId =>
      getSettingWidget(
        settingsDefs,
        settingId,
        storedSettings,
        computedSettings,
        object,
        onChangeSettings,
        extra,
      ),
    )
    .filter(widget => widget.widget);
}

export function getPersistableDefaultSettings(
  settingsDefs: VisualizationSettingsDefinitions,
  completeSettings,
) {
  const persistableDefaultSettings = {};
  for (const settingId in settingsDefs) {
    const settingDef = settingsDefs[settingId];
    if (settingDef.persistDefault) {
      persistableDefaultSettings[settingId] = completeSettings[settingId];
    }
  }
  return persistableDefaultSettings;
}

export function updateSettings(storedSettings, changedSettings) {
  for (const key of Object.keys(changedSettings)) {
    MetabaseAnalytics.trackStructEvent("Chart Settings", "Change Setting", key);
  }
  const newSettings = {
    ...storedSettings,
    ...changedSettings,
  };
  // remove undefined settings
  for (const [key, value] of Object.entries(changedSettings)) {
    if (value === undefined) {
      delete newSettings[key];
    }
  }
  return newSettings;
}

// Merge two settings objects together.
// Settings from the second argument take precedence over the first.
export function mergeSettings(first = {}, second = {}) {
  // Note: This hardcoded list of all nested settings is potentially fragile,
  // but both the list of nested settings and the keys used are very stable.
  const nestedSettings = ["series_settings", "column_settings"];
  const merged = { ...first, ...second };
  for (const key of nestedSettings) {
    // only set key if one of the objects to be merged has that key set
    if (first[key] != null || second[key] != null) {
      merged[key] = {};
      for (const nestedKey of Object.keys({ ...first[key], ...second[key] })) {
        merged[key][nestedKey] = mergeSettings(
          getIn(first, [key, nestedKey]) || {},
          getIn(second, [key, nestedKey]) || {},
        );
      }
    }
  }
  return merged;
}

export function getClickBehaviorSettings(settings) {
  const newSettings = {};

  if (settings.click_behavior) {
    newSettings.click_behavior = settings.click_behavior;
  }

  const columnSettings = getColumnClickBehavior(settings.column_settings);
  if (columnSettings) {
    newSettings.column_settings = columnSettings;
  }

  return newSettings;
}

function getColumnClickBehavior(columnSettings) {
  if (columnSettings == null) {
    return null;
  }

  return Object.entries(columnSettings)
    .filter(([_, fieldSettings]) => fieldSettings.click_behavior != null)
    .reduce((acc, [key, fieldSettings]) => {
      return {
        ...acc,
        [key]: {
          click_behavior: fieldSettings.click_behavior,
        },
      };
    }, null);
}

const KEYS_TO_COMPARE = new Set([
  "number_style",
  "currency",
  "currency_style",
  "number_separators",
  "decimals",
  "scale",
  "prefix",
  "suffix",
]);

export function getLineAreaBarComparisonSettings(columnSettings) {
  return _.pick(columnSettings, (value, key) => {
    if (!KEYS_TO_COMPARE.has(key)) {
      return false;
    }
    if ((key === "prefix" || key === "suffix") && value === "") {
      return false;
    }
    return true;
  });
}
