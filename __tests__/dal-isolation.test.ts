import { describe, it, expect, vi } from 'vitest';
import { withTenantIsolation } from '../lib/dal/isolation';

describe('Security Guardrails - Tenant Isolation', () => {
    it('appends .eq("created_by", userId) when isAdmin is false', () => {
        const mockQuery = {
            eq: vi.fn().mockReturnThis()
        };
        
        const result = withTenantIsolation(mockQuery as any, 'user-123', false);
        
        expect(mockQuery.eq).toHaveBeenCalledTimes(1);
        expect(mockQuery.eq).toHaveBeenCalledWith('created_by', 'user-123');
        expect(result).toBe(mockQuery);
    });

    it('bypasses isolation when isAdmin is true', () => {
        const mockQuery = {
            eq: vi.fn().mockReturnThis()
        };
        
        const result = withTenantIsolation(mockQuery as any, 'user-123', true);
        
        expect(mockQuery.eq).not.toHaveBeenCalled();
        expect(result).toBe(mockQuery);
    });
});
