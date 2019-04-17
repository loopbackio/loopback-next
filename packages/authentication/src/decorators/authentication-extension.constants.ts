import {BindingScope, BindingTemplate} from '@loopback/context';

/**
 * A factory function to create binding template for extensions of the given
 * extension point
 * @param extensionPoint Name/id of the extension point
 */
export function extensionFor(extensionPoint: string): BindingTemplate {
  return binding =>
    binding.inScope(BindingScope.TRANSIENT).tag({extensionPoint}); //this needs to be transient, e.g. for request level context.
}

/**
 * A binding template for authentication-strategy extensions
 */
export const asAuthenticationStrategy: BindingTemplate = binding => {
  extensionFor('authentication-strategy')(binding);
  binding.tag({namespace: 'authentication-strategies'});
};
