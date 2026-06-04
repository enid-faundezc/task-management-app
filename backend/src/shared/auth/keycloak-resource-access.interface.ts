export interface KeycloakResourceAccess {
  [client: string]: {
    roles: string[];
  };
}
