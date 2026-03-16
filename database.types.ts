export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
    public: {
        Tables: {
            destinations: {
                Row: {
                    id: number;
                    created_at: string;
                    name: string | null;
                    population: number | null;
                    currency: string | null;
                    timezone: string | null;
                    country: string | null;
                    language: string | null;
                    cover_image_url: string | null;
                    short_description: string | null;
                    city_slug: string | null;
                };
                Insert: {
                    // Optional fields on insert
                    name?: string | null;
                    population?: number | null;
                    currency?: string | null;
                    timezone?: string | null;
                    country?: string | null;
                    language?: string | null;
                    cover_image_url?: string | null;
                    short_description?: string | null;
                    city_slug?: string | null;
                    created_at?: string;
                };
                Update: {
                    // Optional fields on update
                    name?: string | null;
                    population?: number | null;
                    currency?: string | null;
                    timezone?: string | null;
                    country?: string | null;
                    language?: string | null;
                    cover_image_url?: string | null;
                    short_description?: string | null;
                    city_slug?: string | null;
                    created_at?: string;
                };
            };

            // Add other tables here, e.g. `places`, `users`, etc.
        };
        Views: {};
        Functions: {};
    };
}