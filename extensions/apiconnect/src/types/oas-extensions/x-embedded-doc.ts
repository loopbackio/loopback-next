/**
 * {@see https://www.ibm.com/docs/en/api-connect/10.0.x?topic=cvapdbuc-using-x-embedded-doc-add-additional-documentation-products-apis}
 */
export interface XEmbeddedDoc {
  /**
   * The name of the embedded document.
   */
  name: string;
  /**
   * The display title of the embedded document.
   */
  title: string;
  /**
   * The format of the embedded document
   * {@link XEmbeddedDoc.content | content} value.
   * @defaultValue `'md'`
   */
  format?: 'b64html' | 'md';
  /**
   * The base64 encoded html of page, or, the markdown string.
   */
  content?: string;
  /**
   * Additional embedded documentation.
   *
   * @remarks
   * If no content is specified for parent, then the first child is the
   * content that is shown.
   */
  docs?: XEmbeddedDoc[];
}
