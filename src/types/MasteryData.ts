export interface MasteryData {
    grandmaster: string[];
    master: string[];
    adept: string[];
    apprentice: string[];
    initiate: string[];
    novice: string[];
}

export interface MasteryConfiguration {
    pvme_guild_id: string;
    pvme_staff_id: string;
    pvme_retired_staff_id: string;
    role_data?: object;
}
