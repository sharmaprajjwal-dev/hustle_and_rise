# Email integration plan

## Provider decision

Sender.net is the selected email provider. The one-time job-email backend and frontend boundary are implemented but inactive; no Sender.net account or production Supabase project is connected yet. Mailchimp is not part of the project plan.

The intended split is:

- **Marketing email:** an explicit newsletter signup that adds a consenting subscriber to a Sender.net group.
- **Transactional email:** one-recipient messages triggered by a direct user action, such as a future “email this job” feature.

## Safe architecture

All Sender.net API calls run through the `email-job` Supabase Edge Function. The API token must never appear in an Astro client script, a `PUBLIC_` environment variable, the repository, or generated HTML.

Sender.net requires an account, an API access token, and an authenticated sending domain. Production setup therefore waits until the hosting platform and site domain are confirmed.

The request log stores only keyed hashes of the recipient email and network address, the selected job, delivery status, and timestamps. Plain recipient addresses are sent directly to Sender.net and are not written to the database. The function opportunistically removes audit rows older than 30 days and limits repeated requests by email and network address.

## Required Edge Function secrets

Set these only in Supabase Edge Function Secrets:

```text
SENDER_API_TOKEN
SENDER_FROM_EMAIL
SENDER_FROM_NAME
EMAIL_HASH_SECRET
SITE_URL
```

`EMAIL_HASH_SECRET` must be a long random value used only for keyed audit hashes. `SENDER_FROM_EMAIL` must belong to the authenticated sending domain. Supabase supplies its own database URL and secret keys to the function.

## Owner setup checklist

1. Create or sign in to the Sender.net account.
2. Add the production sending domain and complete the SPF, DKIM, and DMARC records supplied by Sender.net.
3. Create a newsletter group and record its identifier.
4. Create an API token, copy it once, and store it only in the production host's secret environment settings.
5. Confirm the public sender name, sender address, reply-to address, and consent wording.
6. Link the repository to the production Supabase project, apply the migration, deploy `email-job`, and set the secrets above.
7. Send test messages and review Sender.net delivery logs.
8. Set `PUBLIC_EMAIL_JOB_ENABLED=true` in the production website build only after the live test succeeds.
9. Test delivery, rate limiting, error handling, mobile layout, and the Privacy Statement before publishing the form.

No account IDs, group IDs, domain records, or tokens should be guessed or committed.
