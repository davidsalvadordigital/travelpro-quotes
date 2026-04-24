import "server-only";
import { createServiceClient } from "@/lib/supabase-server";
import { cacheTag, cacheLife } from "next/cache";
import { z } from "zod";

/**
 * Zod Schema for User Profile
 * Validates external data from Supabase.
 */
export const userProfileSchema = z.object({
    id: z.string().uuid(),
    full_name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "asesora"]),
    avatar_url: z.string().url().nullable().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Data Access Layer — Profiles
 * Securely fetch user profile data.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    'use cache';
    
    if (!userId) return null;

    const supabase = createServiceClient();
    
    cacheTag(`profile-${userId}`);
    cacheLife("hours");

    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url")
        .eq("id", userId)
        .single();

    if (error) {
        console.error(`Error fetching profile for ${userId}:`, error.message);
        return null;
    }

    // 🛡️ Zero-Trust Input: Validate via Zod
    const result = userProfileSchema.safeParse(data);
    if (!result.success) {
        console.error(`Validation error for profile ${userId}:`, result.error.format());
        return null;
    }

    return result.data;
}
