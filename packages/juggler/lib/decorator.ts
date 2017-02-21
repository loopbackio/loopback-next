/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:any)}
 */
export function model(definition?: Object) {
  return function(target: any) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function property(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for relations
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function relation(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for belongsTo
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function belongsTo(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for hasOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasOne(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for hasMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasMany(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for embedsOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsOne(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}


/**
 * Decorator for embedsMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsMany(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}


/**
 * Decorator for referencesOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesOne(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for referencesMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesMany(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}
