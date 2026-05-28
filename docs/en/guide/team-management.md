# Team Management

The **Team** section allows the organization owner and administrators to manage members, send invitations, and control access levels across the platform.

## User Roles

SREBot uses a four-level role model within each organization. The set of available actions depends on the assigned role.

| Role | Incidents | Billing | Bot Settings | Team Management |
|---|---|---|---|---|
| **Owner** | ✅ View | ✅ Full access | ✅ Full access | ✅ Full access |
| **Admin** | ✅ View | ✅ Full access | ✅ Full access | ✅ Invite & manage members |
| **Member** | ✅ View | ❌ No access | ❌ No access | ❌ No access |
| **Viewer** | ✅ View | ❌ No access | ❌ No access | ❌ No access |

::: info One organization, one owner
Every organization has exactly one **Owner**. The user who creates the organization automatically receives this role. The Owner cannot be removed or demoted — only replaced via **ownership transfer**.
:::

### Role Descriptions

**Owner**

The highest role in the organization. Only the Owner can:
- Transfer ownership to another member.
- Promote members to Admin.
- Remove Admins from the organization.

**Admin**

Can manage the team: invite new members, change their roles (Member and Viewer only), and remove regular members. Cannot modify the role of or remove the Owner or other Admins.

**Member**

A full team member with access to incident analytics. No access to billing, bot configuration, or team management.

**Viewer**

Minimum access level. Can only view the incident list and incident details.

---

## Inviting Members

**Owners** and **Admins** can invite new users.

1. Go to the **Team** section in the sidebar.
2. In the **«Invite New Member»** form, enter the email address and select a role.
3. Click **«Send Invitation»**.

An invitation link will be sent to the specified email, valid for **48 hours**.

::: tip Choosing a role when inviting
You can invite a user as a **Viewer**, **Member**, or **Admin**. The **Owner** role cannot be assigned via invitation — it can only be transferred to an existing member.
:::

### Accepting an Invitation

The user follows the link from the email. What happens next depends on whether they are already registered in SREBot:

**New user**

An account creation form is displayed. The user must set a password (minimum 8 characters). After clicking the button, the user is automatically logged in and redirected to the dashboard.

**Existing user**

An identity confirmation form is displayed. The user must enter the password for their existing account. This requirement protects against unauthorized access in the event the invitation link is intercepted.

::: warning Invitation link security
The link expires after 48 hours. Never share it in public places — anyone who obtains the link can accept the invitation. If the link has been compromised, revoke the invitation in the **«Pending Invitations»** section.
:::

---

## Managing Members

All current members of the organization are listed in the **«Active Members»** table.

### Changing a Role

The Owner and Admins can change member roles via the dropdown in the **Actions** column.

Restrictions:
- An **Admin** cannot change the role of the **Owner** or another **Admin**.
- An **Admin** cannot promote members to **Admin** — only the Owner can do this.
- No one can change their own role.

### Removing a Member

Click the trash icon in the row of the member you want to remove. You will be prompted to confirm the action.

Restrictions:
- The **Owner** cannot be removed from the organization.
- An **Admin** cannot remove another **Admin**.
- You cannot remove yourself from the organization.

---

## Transferring Ownership

If you are the **Owner** and want to hand over the organization to another member:

1. Go to the **Team** section.
2. In the target member's row, select **«Owner (Transfer)»** from the role dropdown.
3. Confirm the action in the dialog box.

::: danger Warning: irreversible action
After transferring ownership, you are automatically demoted to **Admin**. The new Owner gains full control over the organization, including the right to transfer ownership again.
:::

---

## Managing Invitations

The **«Pending Invitations»** block (visible to Owners and Admins only) shows all invitations that have been sent but not yet accepted.

- Each invitation displays: email, assigned role, and expiry date.
- Click **«Revoke»** to cancel an invitation before it is accepted.
- After 48 hours, an invitation automatically becomes invalid.
