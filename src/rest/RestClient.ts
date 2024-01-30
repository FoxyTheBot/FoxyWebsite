import express from 'express';
import axios, { type AxiosResponse } from 'axios';
require('dotenv').config();

export class RestClient {
    private app: any;
    private foxyAPI: any;
    private discord: any;
    private user: any;

    constructor() {
        this.app = express();
        this.foxyAPI = axios.create({
            baseURL: process.env.FOXY_API_URL,
            headers: {
                'Authorization': `${process.env.FOXY_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        this.discord = axios.create({
            baseURL: 'https://discord.com/api/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        this.user = axios.create({
            baseURL: 'https://discord.com/api/users/@me'
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    }

    public async getUser(userId: String): Promise<any> {
        const data = (await this.foxyAPI.get(`/user/token/${userId}`)).data;

        const user = await (this.user.get('/', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        }));

        return user.data;
    }
}