// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AsyncDynamicQuestionProperty,
  CheckboxChoiceMap,
  CheckboxChoiceOptions,
  DistinctChoice,
  DynamicQuestionProperty,
  ListChoiceMap,
  ListChoiceOptions,
} from 'inquirer';
import {Answers, Question} from 'yeoman-generator';

/**
 * Check if a question can be skipped in `express` mode
 * @param {object} question A yeoman prompt
 */
export function isQuestionOptional<T extends Answers>(
  question: Question<T>,
  options: Record<string, unknown>,
) {
  const varName = question.name as string;
  return (
    question.default != null || // Having a default value
    options[varName] != null || // Configured in options
    question.type === 'list' || // A list
    question.type === 'rawlist' || // A raw list
    question.type === 'checkbox' || // A checkbox
    question.type === 'confirm'
  ); // A confirmation
}

export async function resolveDynamicProperty<T, A extends Answers>(
  answers: A,
  prop: AsyncDynamicQuestionProperty<T, A> | DynamicQuestionProperty<T>,
) {
  let val: T;
  if (typeof prop === 'function') {
    const fn = prop as (answers: A) => T | Promise<T>;
    val = await fn(answers);
  } else {
    val = await prop;
  }
  return val;
}

export async function getChoiceValue<T extends Answers>(
  answers: T,
  choice: DistinctChoice<ListChoiceMap<T>>,
) {
  if (typeof choice !== 'object') {
    return choice;
  }
  switch (choice.type) {
    case 'choice': {
      const options = choice as ListChoiceOptions;
      const disabled = await resolveDynamicProperty(answers, options.disabled);
      if (disabled) return undefined;
      return choice.value ?? choice.name;
    }
  }
  return undefined;
}

export async function isChoiceChecked<T extends Answers>(
  answers: T,
  choice: DistinctChoice<CheckboxChoiceMap<T>>,
) {
  if (typeof choice !== 'object') {
    return true;
  }
  const options = choice as CheckboxChoiceOptions;
  if (options.checked) return true;
  const disabled = await resolveDynamicProperty(answers, options.disabled);
  return options.checked && !disabled;
}

/**
 * Get the default answer for a question
 * @param {*} question
 */
export async function getDefaultAnswer<T extends Answers>(
  question: Question<T>,
  answers: T,
) {
  // First check existing answers
  let defaultVal = answers[question.name as string];
  if (defaultVal != null) return defaultVal;

  // Now check the `default` of the prompt
  let def = question.default;
  if (typeof question.default === 'function') {
    def = await question.default(answers);
  }
  defaultVal = def;

  if (question.type === 'confirm') {
    return defaultVal != null ? defaultVal : true;
  }
  if (question.type === 'list' || question.type === 'rawlist') {
    const choices =
      (await resolveDynamicProperty(answers, question.choices)) ?? [];
    // Default to 1st item
    if (def == null) def = 0;
    if (typeof def === 'number') {
      // The `default` is an index
      const choice = choices[def];
      defaultVal = await getChoiceValue(answers, choice);
    } else {
      // The default is a value
      for (const choice of choices) {
        const values = await getChoiceValue(answers, choice);
        if (values.includes(def)) {
          defaultVal = def;
          break;
        }
      }
    }
  } else if (question.type === 'checkbox') {
    const choices =
      (await resolveDynamicProperty(answers, question.choices)) ?? [];
    if (def == null) {
      defaultVal = choices
        .filter(c => isChoiceChecked(answers, c))
        .map(c => getChoiceValue(answers, c));
    } else {
      const values: unknown[] = [];
      for (const d of def) {
        if (typeof d === 'number') {
          const choice = choices[d];
          const val = await getChoiceValue(answers, choice);
          values.push(val);
        } else {
          for (const c of choices) {
            const val = await getChoiceValue(answers, c);
            if (d === val) {
              values.push(d);
              break;
            }
          }
          values.push(undefined);
        }
      }
      defaultVal = values.filter((v: unknown) => v != null);
    }
  }
  return defaultVal;
}
