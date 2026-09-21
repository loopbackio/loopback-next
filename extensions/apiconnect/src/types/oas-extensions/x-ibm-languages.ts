/* eslint-disable @typescript-eslint/naming-convention */
/**
 * {@see https://www.ibm.com/docs/en/api-connect/10.0.x?topic=cvapdbuc-using-x-languages-create-multilingual-api-product-documentation}
 */
export interface XIBMLanguages {
  [prop: string]: {
    zh_cn?: string;
    zh_tw?: string;
    nl?: string;
    fr?: string;
    de?: string;
    it?: string;
    ja?: string;
    ko?: string;
    pt?: string;
    es?: string;
    tr?: string;
  } & (
    | {
        en: string;
        default_language_code: string;
      }
    | {}
  );
}
