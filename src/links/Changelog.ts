type ChangelogEntry = {
    version: [number, number, number],
    date: Date;
    commitHash: string;
    changes: string[];
}

type Changelog = ChangelogEntry[];

const changelog: Changelog = [
    {
        version: [2,0,0],
        date: new Date(2020, 5, 17),
        commitHash: "739d69b3a54a05e1f5e5bd46c84f3e3dc062eef3",
        changes: [
            "Version 2 released"
        ]
    }
]

changelog[0].date.toLocaleDateString()

export default changelog;