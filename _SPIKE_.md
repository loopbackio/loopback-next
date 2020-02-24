TODO:

- When importing multiple models, cache the list of known models
  + update the list with newly imported models
- When importing models, sort them by inheritance, so that base models
  are imported before children
- Instead of failing when a base model was not found, ask the user if they
  want to include the base model in the import job too
