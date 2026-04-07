<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps([
  'permissionRoles',
  'selectedPermissionRole',
  'selectedPermissionRoleId',
  'selectedPermissionEnabledModuleCount',
  'selectedPermissionFullAccessCount',
  'selectedPermissionAssignedUsersCount',
  'permissionRolesHasUnsavedChanges',
  'isSavingPermissionRoles',
  'isPermissionRoleEditMode',
  'permissionRoleLookupValue',
  'permissionRoleDraftName',
  'permissionModuleSections',
  'canEditBusinessModule',
  'formatPermissionRoleAccessSummary',
  'getPermissionModulesForSection',
  'isPermissionModuleFullAccess',
  'formatPermissionAccessLabel',
  'countPermissionRoleEnabledModules',
  'countPermissionRoleFullAccessModules',
  'countUsersAssignedToRole',
  'togglePermissionRoleEditMode',
  'handlePermissionRoleLookupInput',
  'applyPermissionRoleLookupSelection',
  'removeSelectedPermissionRole',
  'createPermissionRole',
  'savePermissionRoles',
  'updatePermissionModuleAction',
  'updatePermissionModuleFullAccess',
  'setPermissionRoleDraftName',
  'setSelectedPermissionRoleId',
])

const {
  selectedPermissionRole,
  selectedPermissionEnabledModuleCount,
  selectedPermissionFullAccessCount,
  selectedPermissionAssignedUsersCount,
  isPermissionRoleEditMode,
  canEditBusinessModule,
  formatPermissionRoleAccessSummary,
} = toRefs(props)

const canManagePermissions = computed(() => canEditBusinessModule.value('permissions'))
const permissionRoleEditorHint = computed(() =>
  isPermissionRoleEditMode.value
    ? 'Select an existing role, then use the access matrix below to update which modules appear in the sidebar and what that role can do.'
    : 'Create a role first, then use the access matrix below to assign which modules appear in the sidebar and what that role can do.',
)
const selectedRoleAccessSummary = computed(() =>
  selectedPermissionRole.value
    ? formatPermissionRoleAccessSummary.value(selectedPermissionRole.value)
    : 'Choose a role from the list to review its access matrix.',
)
</script>

<template>
  <section class="business-permissions permission-rules">
    <div class="business-permissions__hero">
      <div class="business-permissions__hero-copy">
        <p class="business-permissions__eyebrow">Permissions</p>
        <h2>Role and module access matrix</h2>
        <p>Updated to match the admin RBAC flow more closely, with a dedicated role directory and a cleaner permission editor for each workspace role.</p>
      </div>
      <div class="business-permissions__hero-stats">
        <span class="business-permissions__hero-chip">{{ permissionRoles.length }} roles</span>
        <span class="business-permissions__hero-chip">{{ selectedPermissionEnabledModuleCount }} modules visible</span>
        <span class="business-permissions__hero-chip">{{ selectedPermissionFullAccessCount }} full access</span>
      </div>
    </div>

    <div class="business-permissions__layout permission-rules__layout">
      <aside class="business-permissions__panel permission-rules__panel permission-rules__panel--roles">
        <div class="business-permissions__panel-head">
          <div>
            <p class="business-permissions__panel-label">Role Directory</p>
            <h3>Saved workspace roles</h3>
          </div>
          <span class="business-permissions__panel-chip">{{ permissionRoles.length }} active</span>
        </div>

        <p class="business-permissions__intro-copy">
          Pick a role to review its sidebar visibility, editing permissions, and full-access modules.
        </p>

        <div v-if="permissionRoles.length" class="permission-rules__role-list">
          <button
            v-for="role in permissionRoles"
            :key="role.id"
            type="button"
            class="permission-rules__role-card"
            :class="{ 'is-active': selectedPermissionRoleId === role.id }"
            :aria-pressed="selectedPermissionRoleId === role.id"
            @click="setSelectedPermissionRoleId(role.id)"
          >
            <div class="permission-rules__role-card-main">
              <span class="business-permissions__role-swatch" :style="{ background: role.color }" />
              <div class="business-permissions__role-copy">
                <strong>{{ role.name }}</strong>
                <small>
                  {{ countUsersAssignedToRole(role.id) }}
                  {{ countUsersAssignedToRole(role.id) === 1 ? 'assigned user' : 'assigned users' }}
                </small>
              </div>
            </div>
            <div class="permission-rules__role-card-metrics">
              <span>{{ countPermissionRoleEnabledModules(role) }} visible</span>
              <span>{{ countPermissionRoleFullAccessModules(role) }} full access</span>
            </div>
          </button>
        </div>

        <div v-else class="permission-rules__empty">
          No roles available yet. Create one in the editor to start building your workspace permissions.
        </div>
      </aside>

      <div class="business-permissions__panel business-permissions__panel--editor permission-rules__panel permission-rules__panel--editor">
        <div class="business-permissions__panel-head">
          <div>
            <p class="business-permissions__panel-label">Module Access</p>
            <h3>{{ selectedPermissionRole?.name || 'Select a role from the directory' }}</h3>
            <p v-if="selectedPermissionRole" class="business-permissions__role-meta">
              {{ selectedRoleAccessSummary }}
              <span aria-hidden="true">|</span>
              {{ selectedPermissionAssignedUsersCount }}
              {{ selectedPermissionAssignedUsersCount === 1 ? 'assigned user' : 'assigned users' }}
            </p>
          </div>

          <div class="business-permissions__panel-tools">
            <p
              class="business-permissions__save-state"
              :class="{ 'is-unsaved': permissionRolesHasUnsavedChanges || isSavingPermissionRoles }"
            >
              {{ isSavingPermissionRoles ? 'Saving to Firebase' : permissionRolesHasUnsavedChanges ? 'Unsaved changes' : 'Saved to workspace' }}
            </p>

            <span
              v-if="selectedPermissionRole"
              class="business-permissions__role-tag"
              :style="{ '--role-color': selectedPermissionRole.color }"
            >
              {{ selectedPermissionRole.name }}
            </span>

            <div class="business-permissions__panel-actions">
              <button
                type="button"
                class="business-permissions__secondary business-permissions__mode-button"
                :class="{ 'is-active': isPermissionRoleEditMode }"
                @click="togglePermissionRoleEditMode"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <div class="permission-rules__summary-grid">
          <article class="permission-rules__summary-card">
            <span>Visible Modules</span>
            <strong>{{ selectedPermissionEnabledModuleCount }}</strong>
            <small>Shown in the sidebar for this role.</small>
          </article>
          <article class="permission-rules__summary-card">
            <span>Full Access</span>
            <strong>{{ selectedPermissionFullAccessCount }}</strong>
            <small>Modules with complete editing power.</small>
          </article>
          <article class="permission-rules__summary-card">
            <span>Assigned Users</span>
            <strong>{{ selectedPermissionAssignedUsersCount }}</strong>
            <small>Workspace logins currently linked to this role.</small>
          </article>
        </div>

        <div class="business-permissions__controls">
          <div class="business-permissions__control-grid">
            <label class="business-permissions__field business-permissions__field--stacked">
              <span>{{ isPermissionRoleEditMode ? 'Search Existing Role' : 'Create New Role' }}</span>
              <div class="business-permissions__inline-action business-permissions__inline-action--compact">
                <template v-if="isPermissionRoleEditMode">
                  <input
                    :value="permissionRoleLookupValue"
                    list="business-permissions-role-options"
                    type="text"
                    placeholder="Search or select an existing role"
                    @input="handlePermissionRoleLookupInput"
                    @change="applyPermissionRoleLookupSelection"
                    @keydown.enter.prevent="applyPermissionRoleLookupSelection"
                  />
                  <datalist id="business-permissions-role-options">
                    <option
                      v-for="role in permissionRoles"
                      :key="role.id"
                      :value="role.name"
                    />
                  </datalist>
                  <button
                    type="button"
                    class="business-permissions__danger business-permissions__action-delete"
                    :disabled="!canManagePermissions || !selectedPermissionRole"
                    @click="removeSelectedPermissionRole"
                  >
                    Delete Role
                  </button>
                </template>

                <template v-else>
                  <input
                    :value="permissionRoleDraftName"
                    type="text"
                    placeholder="e.g. Recruitment Lead"
                    :disabled="!canManagePermissions"
                    @input="setPermissionRoleDraftName($event.target.value)"
                    @keydown.enter.prevent="createPermissionRole"
                  />
                  <button
                    type="button"
                    class="business-permissions__inline-button"
                    :disabled="!canManagePermissions || !String(permissionRoleDraftName || '').trim()"
                    @click="createPermissionRole"
                  >
                    Create Role
                  </button>
                </template>

                <button
                  type="button"
                  class="business-permissions__primary business-permissions__action-save"
                  :class="{ 'is-saved': !permissionRolesHasUnsavedChanges && !isSavingPermissionRoles }"
                  :disabled="!canManagePermissions || !permissionRolesHasUnsavedChanges || isSavingPermissionRoles"
                  @click="savePermissionRoles"
                >
                  {{ isSavingPermissionRoles ? 'Saving...' : permissionRolesHasUnsavedChanges ? 'Save Permissions' : 'Saved' }}
                </button>
              </div>
            </label>
          </div>
        </div>

        <p class="business-permissions__intro-copy">
          {{ permissionRoleEditorHint }}
        </p>

        <div v-if="selectedPermissionRole" class="business-permissions__table-wrap business-permissions__table-wrap--matrix">
          <table class="business-permissions__table business-permissions__table--matrix">
            <thead>
              <tr>
                <th>Section</th>
                <th>Module</th>
                <th>View</th>
                <th>Edit</th>
                <th>Full Access</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="section in permissionModuleSections" :key="section.id">
                <tr
                  v-for="module in getPermissionModulesForSection(section.id)"
                  :key="module.id"
                  class="business-permissions__table-row"
                  :class="{ 'is-muted': !module.permissions.view }"
                >
                  <td>
                    <span class="business-permissions__section-chip">
                      <i :class="section.icon" aria-hidden="true" />
                      {{ section.label }}
                    </span>
                  </td>
                  <td>
                    <div class="business-permissions__module-copy">
                      <strong>{{ module.label }}</strong>
                      <p>{{ module.description }}</p>
                    </div>
                  </td>
                  <td>
                    <label class="business-permissions__switch" :aria-label="`Toggle view access for ${module.label}`">
                      <input
                        type="checkbox"
                        class="business-permissions__switch-input"
                        :checked="module.permissions.view"
                        :disabled="!canManagePermissions"
                        @change="updatePermissionModuleAction(module.id, 'view', $event.target.checked)"
                      />
                      <span class="business-permissions__switch-track" aria-hidden="true">
                        <span class="business-permissions__switch-thumb" />
                      </span>
                    </label>
                  </td>
                  <td>
                    <label class="business-permissions__switch" :aria-label="`Toggle edit access for ${module.label}`">
                      <input
                        type="checkbox"
                        class="business-permissions__switch-input"
                        :checked="module.permissions.edit"
                        :disabled="!canManagePermissions"
                        @change="updatePermissionModuleAction(module.id, 'edit', $event.target.checked)"
                      />
                      <span class="business-permissions__switch-track" aria-hidden="true">
                        <span class="business-permissions__switch-thumb" />
                      </span>
                    </label>
                  </td>
                  <td>
                    <label class="business-permissions__switch" :aria-label="`Toggle full access for ${module.label}`">
                      <input
                        type="checkbox"
                        class="business-permissions__switch-input"
                        :checked="isPermissionModuleFullAccess(module)"
                        :disabled="!canManagePermissions"
                        @change="updatePermissionModuleFullAccess(module.id, $event.target.checked)"
                      />
                      <span class="business-permissions__switch-track" aria-hidden="true">
                        <span class="business-permissions__switch-thumb" />
                      </span>
                    </label>
                  </td>
                  <td>
                    <span
                      class="business-permissions__status-pill"
                      :class="{
                        'is-hidden': !module.permissions.view,
                        'is-full': isPermissionModuleFullAccess(module),
                      }"
                    >
                      {{ formatPermissionAccessLabel(module) }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-else class="permission-rules__empty">
          Choose a role from the left panel or create a new one to start managing module access.
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.permission-rules {
  display: grid;
  gap: 1rem;
}

.permission-rules__layout {
  grid-template-columns: minmax(18rem, 22rem) minmax(0, 1fr);
}

.permission-rules__panel {
  min-width: 0;
}

.permission-rules__role-list {
  display: grid;
  gap: 0.7rem;
}

.permission-rules__role-card {
  display: grid;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #dbe2de;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbfa 100%);
  text-align: left;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.permission-rules__role-card:hover {
  transform: translateY(-1px);
  border-color: #c5cec8;
  box-shadow: 0 12px 22px rgba(17, 24, 39, 0.07);
}

.permission-rules__role-card.is-active {
  border-color: #94a3b8;
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
}

.permission-rules__role-card-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.permission-rules__role-card-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.permission-rules__role-card-metrics span {
  display: inline-flex;
  align-items: center;
  min-height: 1.85rem;
  padding: 0.26rem 0.62rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.72rem;
  font-weight: 700;
}

.permission-rules__summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.permission-rules__summary-card {
  display: grid;
  gap: 0.3rem;
  padding: 0.9rem;
  border: 1px solid #dbe2de;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8faf9 100%);
}

.permission-rules__summary-card span {
  color: #4b5563;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.permission-rules__summary-card strong {
  color: #111827;
  font-size: 1.45rem;
  line-height: 1;
}

.permission-rules__summary-card small {
  color: #6b7280;
  line-height: 1.45;
}

.permission-rules__empty {
  padding: 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 14px;
  background: #f9fafb;
  color: #6b7280;
  line-height: 1.55;
}

@media (max-width: 1100px) {
  .permission-rules__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .permission-rules__summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
