import { UserRoleDetails } from "../types/userRoles";

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  DEVELOPER_ADMIN: "Developer Admin",
  PROJECT_ADMIN: "Project Admin",
  REVIEWER: "Reviewer",
  USER: "User",
  DEVELOPER: "Developer",
};
export const PERMISSIONS = {
  USER_MANAGEMENT: "USER_MANAGEMENT",
  VIEW_PROJECT: "VIEW_PROJECT",
  CREATE_PROJECT: "CREATE_PROJECT",
  UPDATE_PROJECT: "UPDATE_PROJECT",
  CREATE_CHANGES: "CREATE_CHANGES",
  UPDATE_CHANGES: "UPDATE_CHANGES",
};

export const PERMISSIONS_TEXT = {
  ALL: "Has access to all features and projects",
  USER_MANAGEMENT: "Has access to user management features",
  VIEW_PROJECT: "Has access to view all projects",
  CREATE_PROJECT: "Has access to create projects",
  UPDATE_PROJECT: "Has access to update projects",
  CREATE_CHANGES: "Has access to create changes",
  UPDATE_CHANGES: "Has access to update changes",
};

export const hasAllAccess = (currentUser: UserRoleDetails): boolean => {
  if (!currentUser || !currentUser.roles || currentUser.roles.length === 0) return false;
  return currentUser.roles.some((role) => role.role === ROLES.SUPER_ADMIN || role.role === ROLES.DEVELOPER_ADMIN);
};

export const hasSettingsAccess = (user: UserRoleDetails | null): boolean => {
  if (!user || !user.roles || user.roles.length === 0) return false;
  return (
        hasAccess(user, PERMISSIONS.USER_MANAGEMENT) ||
        hasAccess(user, PERMISSIONS.UPDATE_PROJECT)
      );
};

export const filterSettingsProjects = (currentUser: UserRoleDetails | null, projects: Project[] = []): Project[] => {
  if (!currentUser || !currentUser.roles) return [];
  if (hasAllAccess(currentUser)) return projects;
  let accessibleProjects: Project[] = [];
  currentUser.roles.forEach((role) => {
    if ((role.role === ROLES.PROJECT_ADMIN || role.role === ROLES.DEVELOPER) && role.project && role.project.includes("ALL")) {
       accessibleProjects = projects;
    } else if ((role.role === ROLES.PROJECT_ADMIN || role.role === ROLES.DEVELOPER) && role.project) {
      const project = projects.filter(
        (proj) => proj.name && role.project.includes(proj.name),
      );
      if (project) accessibleProjects.push(...project);
    }
  });
  return accessibleProjects;
};

// Maps a requested permission to the actual permission string checked against roles.
// CREATE_PROJECT reuses UPDATE_PROJECT as the gate.
const GLOBAL_PERMISSION_MAP: Partial<Record<string, string>> = {
  [PERMISSIONS.USER_MANAGEMENT]: PERMISSIONS.USER_MANAGEMENT,
  [PERMISSIONS.UPDATE_PROJECT]: PERMISSIONS.UPDATE_PROJECT,
  [PERMISSIONS.UPDATE_CHANGES]: PERMISSIONS.UPDATE_CHANGES,
};

// Permissions that are scoped to a specific project.
const PROJECT_SCOPED_PERMISSIONS = new Set([
  PERMISSIONS.UPDATE_PROJECT,
  PERMISSIONS.CREATE_CHANGES
]);

export const hasProjectCreateAccess = (currentUser: UserRoleDetails | null) => {
  if (
    currentUser?.roles.some((role) => role.role === ROLES.DEVELOPER) ||
    currentUser?.roles.some((role) => role.role === ROLES.DEVELOPER_ADMIN) ||
    currentUser?.roles.some((role) => role.role === ROLES.SUPER_ADMIN)
  ) {
    return true;
  } else {
    return false;
  }
};

const getDisciplineCode = (discipline: string): string => {
  const parts = discipline.split(" ");
  let code = "";
  parts.forEach((part) => {
    if (part.length > 0 && !part.includes('&')) {
      code += part[0][0].toUpperCase();
    }
  });
  return code;
}

const getSafeProjectName = (): string => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem("projectName") || "";
    } catch {
      return "";
    }
  }
  return "";
};

export const checkForDisciplineAccess = (discipline: string | undefined, currentUser: UserRoleDetails | null): boolean => {
  discipline = discipline ? getDisciplineCode(discipline) : discipline;
  if (!currentUser || !currentUser.roles) return false;
  if (hasAllAccess(currentUser)) return true;
  let resolvedProject = getSafeProjectName();
  if(resolvedProject){
    const project_access = currentUser.roles.some(
      (role) =>
        role.role === ROLES.PROJECT_ADMIN &&
        role.project.includes(resolvedProject),
    );
    if (project_access) return true;
  }
  let reviewerRole = currentUser.roles.find((role) => role.role === ROLES.REVIEWER);
  let userRole = currentUser.roles.find((role) => role.role === ROLES.USER);
  if(reviewerRole || userRole){
    const roleToCheck: any = reviewerRole ? reviewerRole : userRole;
    return roleToCheck.disciplines ? roleToCheck.disciplines.includes(discipline) : false;
  } else {
    return true;
  }
};


export const hasAccess = (
  currentUser: UserRoleDetails | null,
  permission: string | undefined = undefined,
  project: string | null = null,
  descipline: string | null = null,
  reviewerOption: string | null = null
): boolean => {
  // By default we are allowing access to view projects for all users also coverd for Super Admin and Developer Admin roles
  if (permission === PERMISSIONS.VIEW_PROJECT || (currentUser && hasAllAccess(currentUser))) return true;
  if (!currentUser?.roles?.length) return false;
  // Global (non-project-scoped) permission checks
  const mappedPermission = permission && GLOBAL_PERMISSION_MAP[permission];
  if (mappedPermission) {
    return currentUser.roles.some((role) => role.permissions.includes(mappedPermission));
  }
  // this is to cover the case of Developer to have access to all except user management
  if(currentUser.roles.some((role) => role.role === ROLES.DEVELOPER && permission !== PERMISSIONS.USER_MANAGEMENT)) return true;

  // Project-level permission checks
  if (!PROJECT_SCOPED_PERMISSIONS.has(permission ?? "")) return false;

  const resolvedProject =
    project ??
    (getSafeProjectName() || null);
  if (!resolvedProject) return false;

  const project_access = currentUser.roles.some(
    (role) =>
      (role.permissions.includes(permission!) || role.permissions.includes("ALL")) &&
      role.project.includes(resolvedProject),
  );
  if (currentUser.roles.some((role) => role.role === ROLES.PROJECT_ADMIN)) {
    // for project admin we are not checking for discipline as they should have access to all disciplines within the project they have access to
    return project_access;
  } else if (descipline) {
    if (reviewerOption) {
      if (reviewerOption === 'Rename') return true;
    }
    return project_access && currentUser.roles.some(
      (role) =>
        role.permissions.includes(permission!) &&
        role.project.includes(resolvedProject) &&
        role.disciplines?.includes(descipline)
    );
  } else {
    // Allow User/Reviewer roles to edit parameters when discipline data is missing. If stricter discipline-level enforcement is needed later, return false here instead.
    if (reviewerOption) {
      return reviewerOption === 'Rename' ? false : true;
    }
    return true;
  }
};
