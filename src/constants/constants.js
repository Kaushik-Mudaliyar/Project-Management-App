export const UserRoleEnums = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};
export const AvailableRoles = Object.values(UserRoleEnums);

export const TaskStatusEnums = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const AvailableStatus = Object.values(TaskStatusEnums);
