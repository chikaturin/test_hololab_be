export enum Permissions {
  // Admin permissions
  USER_MANAGEMENT = 'user_management',
  ROLE_MANAGEMENT = 'role_management',
  VIEW_ALL_DATA = 'view_all_data',

  // Manager permissions
  TEAM_MANAGEMENT = 'team_management',
  APPROVE_REQUESTS = 'approve_requests',

  // Staff permissions
  VIEW_OWN_DATA = 'view_own_data',
  SUBMIT_REQUESTS = 'submit_requests',
}
