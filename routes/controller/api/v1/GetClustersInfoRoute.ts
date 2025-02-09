import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { logger } from "../../../../structures/logger";

export default class GetClustersInfoRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/api/v1/clusters/info", this.getClustersInfo);
    }

    async getClustersInfo(req, res) {
        // const clusters = await fetch("http://localhost:3000/api/v1/info", {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": "Bearer 2LyWJL2m52p7um1LBN4lUPuZHB8APVRb5AFuPEiz-es"
        //     }
        // });
        const clustersUrl = [
            "http://sakuya:5000/api/v1/info",
            "http://foxy-2:5000/api/v1/info",
        ]

        let clusters = [];

        for (const url of clustersUrl) {
            try {
                const currentCluster = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer 2LyWJL2m52p7um1LBN4lUPuZHB8APVRb5AFuPEiz-es"
                    }
                });

                if (currentCluster.status === 200) {
                    const clusterData = await currentCluster.json();
                    clusters.push(clusterData);
                }
            } catch (e) {
                logger.error(`Failed to fetch cluster info from ${url}! Is the cluster down?`);
                continue;
            }
        }



        if (!clusters) {
            return res.status(404).json({ message: 'Clusters not found.' });
        }

        res.status(200).json({
            clusters
        });
    }
}

interface ClusterInfo {
    clusterId: string;
    clusterName: string;
    clusterShards: number;
    clusterPing: number;
    clusterGuilds: number;
    threadCount: number;
    activeJobs: number;
}