#!/usr/bin/env node
//
// Privacy markup and copy contract tests.
//
// Keeps true HTML/copy contracts in one place so the rest of the privacy
// suite can stay focused on behavior and internal policy contracts.
//
// Usage: node test/privacy/test_markup_contracts.mjs
//
import { strict as assert } from 'node:assert';
import {
  createTestRunner,
  loadPrivacyMarkupSource,
  loadPrivacyRuntimeSource,
  loadPrivacyTestApi,
} from './_app_source_utils.mjs';

const { test, done } = createTestRunner();
const { api } = loadPrivacyTestApi();
const appHtml = loadPrivacyMarkupSource();
const runtimeSource = loadPrivacyRuntimeSource();
const deployedPrivacySource = `${appHtml}\n${runtimeSource}`;

console.log('\n-- Privacy markup contracts --');

test('withdrawal fail-closed copy stays explicit', () => {
  assert(!deployedPrivacySource.includes('Proceed anyway?'));
  assert(!deployedPrivacySource.includes('Proceed with self-submit?'));
  assert(!deployedPrivacySource.includes('Confirm relay fallback via entrypoint'));
  assert(!deployedPrivacySource.includes('Relay quote refreshed with unchanged withdrawal data. Reusing proof.'));
  assert(!deployedPrivacySource.includes('Relay withdrawal data changed after quote refresh. Re-generating proof once.'));
  assert(deployedPrivacySource.includes(api.constants.messages.relayQuoteRetryRequired));
});

test('static privacy shell still ships the extracted runtime asset', () => {
  assert(
    appHtml.includes('<script src="./privacy-pools.js"></script>'),
    'index.html must include the privacy runtime script for static ENS/IPFS deployments',
  );
});

test('privacy markup exposes the stable DOM ids used by the live tests', () => {
  const ids = [
    api.constants.dom.privacyTabId,
    api.constants.dom.loadResultsId,
    api.constants.dom.activitySectionId,
    ...api.constants.dom.progressIds,
    ...api.constants.dom.draftHiddenSections,
  ];
  for (const id of ids) {
    assert(appHtml.includes(`id="${id}"`), `missing markup contract id: ${id}`);
  }
});

await done();
