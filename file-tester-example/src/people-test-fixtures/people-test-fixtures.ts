import {
    SpreadsheetTestFile,
    StaticTestFilesDirectory,
    SupertestFileDownloader,
    SupertestFileUploader
} from "@elense/file-tester";
import supertest from "supertest";
import {PeopleFile, PeopleFileData, PeopleFileHeader, PeopleFileType} from "../people/people-file-model";

export class PeopleTestFile extends SpreadsheetTestFile<PeopleFileType, PeopleFileHeader> {
}

export class PeopleTestFixtures {
    static readonly staticFiles: StaticTestFilesDirectory = new StaticTestFilesDirectory(__dirname)

    static get(filepath: 'empty.csv' | 'people.csv' | 'people-1-row-full-data.csv') {
        return PeopleTestFile.get(this.staticFiles.path(filepath), new PeopleFile([]))
    }

    readonly fileUploader = (appOrBaseUrl: any) =>  new SupertestFileUploader({
        appOrBaseUrl: appOrBaseUrl,
        endpointUrl: "/upload"
    })

    readonly fileDownloader = (appOrBaseUrl: any) => new SupertestFileDownloader({
        appOrBaseUrl: appOrBaseUrl,
        endpointUrl: "/download",
        factory: PeopleTestFile.get,
        customizeRequest(request: supertest.Test, downloadParameters: any): supertest.Test {
            return request.query({
                fileId: downloadParameters.fileId
            });
        }
    })
}
