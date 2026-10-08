/**
 * School AI — Multi-Factor Policy Engine
 * 
 * Replaces simplistic numerical hierarchies with context-aware policy evaluation.
 * Evaluates: Authenticated User, School Membership, Permission Level, Resource Ownership,
 * Visibility, Department Matching, Target Action, and Explicit Grants.
 */

import {
  PermissionLevel,
  VisibilityLevel,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  AIToolDefinition,
} from '../types/index.ts';

export class PolicyEngine {
  /**
   * Evaluates if a user is permitted to perform a requested action on a given resource.
   */
  public static evaluateResourceAccess(context: PolicyEvaluationContext): PolicyEvaluationResult {
    const {
      userId,
      permissionLevel,
      userDepartmentId,
      resourceOwnerId,
      resourceVisibility,
      resourceDepartmentId,
      explicitGrant,
      action,
    } = context;

    // Rule 1: School Owner and Full Admin have comprehensive authority within their school
    if (permissionLevel === 'owner' || permissionLevel === 'admin') {
      return { allowed: true };
    }

    // Rule 2: Resource Ownership
    // The creator of a resource has full access to their own resource regardless of permission level
    if (resourceOwnerId && resourceOwnerId === userId) {
      return { allowed: true };
    }

    // Rule 3: Explicit Sharing Grants override default visibility
    if (explicitGrant) {
      if (action === 'read' && (explicitGrant === 'view' || explicitGrant === 'comment' || explicitGrant === 'edit')) {
        return { allowed: true };
      }
      if (action === 'write' && explicitGrant === 'edit') {
        return { allowed: true };
      }
    }

    // Rule 4: Action: Delete or Share requires owner or admin authority unless explicit owner
    if (action === 'delete' || action === 'share') {
      if (resourceOwnerId === userId) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Deleting or sharing institutional resources requires owner or administrator privileges.',
      };
    }

    // Rule 5: Viewers have strictly read-only access to non-private resources
    if (permissionLevel === 'viewer') {
      if (action !== 'read') {
        return { allowed: false, reason: 'Viewer accounts have read-only access.' };
      }
      if (resourceVisibility === 'private') {
        return { allowed: false, reason: 'Private resources are not accessible to viewers.' };
      }
      return { allowed: true };
    }

    // Rule 6: Visibility Level Evaluation for Members and Restricted Members
    if (resourceVisibility === 'private') {
      return {
        allowed: false,
        reason: 'This resource is marked private and can only be accessed by its author.',
      };
    }

    if (resourceVisibility === 'department') {
      if (userDepartmentId && resourceDepartmentId && userDepartmentId === resourceDepartmentId) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'This resource is restricted to authorized department members.',
      };
    }

    if (resourceVisibility === 'school_wide') {
      if (permissionLevel === 'restricted_member') {
        // Restricted members are confined to their specific department plus explicitly shared files
        if (userDepartmentId && resourceDepartmentId && userDepartmentId === resourceDepartmentId) {
          return { allowed: true };
        }
        return {
          allowed: false,
          reason: 'Restricted members can only access department-specific materials.',
        };
      }
      return { allowed: true };
    }

    if (resourceVisibility === 'restricted') {
      // Must have had an explicit grant checked in Rule 3
      return {
        allowed: false,
        reason: 'This resource is restricted. You have not been granted explicit access.',
      };
    }

    return { allowed: false, reason: 'Access denied by school security policy.' };
  }

  /**
   * Evaluates if a user's permission level and role authorizes invoking an AI tool.
   */
  public static evaluateToolInvocation(
    userPermissionLevel: PermissionLevel,
    tool: AIToolDefinition
  ): PolicyEvaluationResult {
    // Read tools are accessible to all active school members
    if (tool.category === 'READ') {
      return { allowed: true };
    }

    // Viewers cannot execute writing or modifying tools
    if (userPermissionLevel === 'viewer') {
      return {
        allowed: false,
        reason: 'Viewer permission level cannot invoke state-altering operations.',
      };
    }

    // Admin-level required tools
    if (tool.requiredPermissionLevel === 'admin' || tool.requiredPermissionLevel === 'owner') {
      if (userPermissionLevel !== 'admin' && userPermissionLevel !== 'owner') {
        return {
          allowed: false,
          reason: `Tool "${tool.toolId}" requires school administrator permissions.`,
        };
      }
    }

    return { allowed: true };
  }
}
