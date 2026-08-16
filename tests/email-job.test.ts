import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml, normalizeEmail, normalizeJobSlug } from "../supabase/functions/email-job/validation";

test("job-email input normalization rejects malformed values", () => {
  assert.equal(normalizeEmail(" Person@Example.COM "), "person@example.com");
  assert.equal(normalizeEmail("person@example"), null);
  assert.equal(normalizeEmail("person@example.com\r\nBcc: attacker@example.com"), null);
  assert.equal(normalizeJobSlug("remote-designer-123"), "remote-designer-123");
  assert.equal(normalizeJobSlug("../../admin"), null);
});

test("job-email markup escapes provider-controlled text", () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});
