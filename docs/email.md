# Email integration plan

## Provider decision

Sender.net is the selected email provider. It is not connected yet, and Mailchimp is not part of the project plan.

The intended split is:

- **Marketing email:** an explicit newsletter signup that adds a consenting subscriber to a Sender.net group.
- **Transactional email:** one-recipient messages triggered by a direct user action, such as a future “email this job” feature.

## Safe architecture

All Sender.net API calls must run in trusted server code. The API token must never appear in an Astro client script, a `PUBLIC_` environment variable, the repository, or generated HTML.

Sender.net requires an account, an API access token, and an authenticated sending domain. Production setup therefore waits until the hosting platform and site domain are confirmed.

## Owner setup checklist

1. Create or sign in to the Sender.net account.
2. Add the production sending domain and complete the SPF, DKIM, and DMARC records supplied by Sender.net.
3. Create a newsletter group and record its identifier.
4. Create an API token, copy it once, and store it only in the production host's secret environment settings.
5. Confirm the public sender name, sender address, reply-to address, and consent wording.
6. Add a server endpoint with validation, rate limiting, abuse protection, and generic error responses.
7. Test consent recording, unsubscribe behavior, delivery, bounce handling, and the Privacy Statement before publishing the form.

No account IDs, group IDs, domain records, or tokens should be guessed or committed.
