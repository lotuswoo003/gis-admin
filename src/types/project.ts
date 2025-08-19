export interface Project {
    id: number;
    name: string;
    partyAName: string;
    partyBName: string;
    startTime: string;
    endTime: string;
    center: string;
}

export interface ProjectPageQuery {
    rows: number;
    page: number;
    name?: string;
}

export interface ProjectSave {
    name: string;
    partyAName: string;
    partyBName: string;
    startTime: string;
    endTime: string;
    center: string;
}

export interface ProjectUpdate extends ProjectSave {
    id: number;
}
