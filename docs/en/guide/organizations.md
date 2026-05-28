# Organization Management

SREBot supports a **multi-organization model**: a single user can belong to multiple organizations with different roles in each. This allows you to manage the infrastructure of different teams or projects from a single account.

---

## Creating an Organization

After registration, the first organization is created **automatically** — the user immediately receives the Owner role and can start using the platform.

To create an **additional** organization:

1. Click the current organization name in the top navigation bar — a dropdown will open.
2. Click the **«+»** button (or navigate directly to `/dashboard/organizations/new`).
3. Fill in the form:
   - **Organization name** — an arbitrary name that will appear in the navigation.
   - **Language / Region** — `RU` (Russian) or `EN` (English).
4. Click **«Create»**.

::: info Billing currency
The currency is determined by the selected language: **Russian → RUB**, **English → USD**. The currency is fixed at the time of organization creation and **cannot be changed** later.
:::

After creation, you will automatically become the **Owner** of the new organization and will be redirected to its context.

---

## Multi-Organization Membership

A user can be a member of any number of organizations, with the role in each one assigned **independently**.

For example, you might be an Owner in one organization and a Viewer in another.

All organizations you belong to are displayed in the **navigation bar dropdown**. Each organization has its own isolated space:

- **Billing** — a separate balance and payment history.
- **Bot tokens** — agent tokens are bound to a specific organization.
- **Team** — its own list of members and invitations.
- **Incidents** — incident data does not overlap between organizations.

---

## Switching Organizations

Switching between organizations does not require re-authentication — simply select the desired organization from the list.

1. Click the **organization name** in the top navigation bar.
2. The dropdown will display all organizations you belong to. The current organization is marked with a **checkmark** (✓).
3. Select the desired organization — the dashboard context will refresh: incidents, billing, team, and tokens will be loaded for the selected organization.
4. At the bottom of the dropdown, there is a **«Create Organization»** button.

::: tip Instant switching
Switching is instant — data is loaded via API without a page reload. The current session is not interrupted.
:::

---

## Organization Context

All data and actions in the dashboard are scoped to the **current organization**. When you switch, the context changes completely:

| Section | What is included in the context |
|---|---|
| **Incidents** | Incident list, analysis details, tool call history |
| **Billing** | Balance, tariff, transaction history, payment methods |
| **Team** | Members, roles, pending invitations |
| **Bot tokens** | Agent tokens for Telegram, Slack, Discord integration |

### Roles and Permissions

Your access rights are determined by your **membership in the current organization**. If you are an Owner in one organization and a Viewer in another, switching to the latter will grant you only Viewer permissions.

For more details on roles, see [Team Management](/en/guide/team-management).

### Fixed Currency

The billing currency is set **once** when the organization is created and cannot be changed. If you need a different currency, create a new organization with the desired language/region.
