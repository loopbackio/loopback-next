// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-webpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, skipIf} from '@loopback/testlab';
import fs from 'fs';
import {Suite} from 'mocha';
import path from 'path';
import puppeteer, {Browser} from 'puppeteer';
import url from 'url';
import {generateBundle} from './test-helper';

//
/*
 * `zombie` fails to load the html file url with 404 on Windows
 * 1) bundle-web.js
 *       "before all" hook for "should see the page with greetings":
 *     Error: Server returned status code 404 from file:///C:/projects/loopback-next/examples/webpack/index.html
 *      at C:\projects\loopback-next\examples\webpack\node_modules\zombie\lib\document.js:649:15
 *      at process._tickCallback (internal/process/next_tick.js:68:7)
 *
 * See https://github.com/assaf/zombie/issues/915
 */
skipIf<[(this: Suite) => void], void>(
  process.platform === 'win32', // Skip on Windows
  describe,
  'bundle-web.js',
  () => {
    before('generate bundle-web.js', async function (this: Mocha.Context) {
      // It may take some time to generate the bundle using webpack
      this.timeout(30000);
      await generateBundle('web');
      expect(
        fs.existsSync(path.join(__dirname, '../../bundle-web.js')),
      ).to.be.true();
    });

    let browser: Browser;
    let html: string;
    before(async function (this: Mocha.Context) {
      this.timeout(15000);
      browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(
        url
          .pathToFileURL(path.join(__dirname, '../../../index.html'))
          .toString(),
        {waitUntil: 'networkidle2'},
      );
      html = await page.content();
      /*
      const bodyHandle = await page.$('body');
      html = await page.evaluate(body => body.innerHTML, bodyHandle);
      await bodyHandle!.dispose();
      */

      await browser.close();
    });

    it('should see the page with greetings', () => {
      let body = html;
      body = body.replace(/\[[^\[\]]+\] /g, '');
      expect(body).to.match(/<li>\(en\) Hello, Jane!<\/li>/);
      expect(body).to.match(/<li>Hello, John!<\/li>/);
      expect(body).to.match(/<li>\(zh\) 你好，John！<\/li>/);
      expect(body).to.match(/<li>\(en\) Hello, Jane!<\/li>/);
    });
  },
);
