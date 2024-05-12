export interface GuildResponse {
    id: string,
    name: string,
    icon: string,
    owner: boolean,
    permissions: number,
    permissions_new: string,
    features: string[]
}