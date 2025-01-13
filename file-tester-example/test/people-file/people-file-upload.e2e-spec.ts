import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {
    FileUploadResult,
    RuntimeTestFilesDirectory,
    SpreadsheetTestFile,
    StaticTestFilesDirectory,
    SupertestFileDownloader,
    SupertestFileUploader,
    TestFile
} from "@elense/file-tester";
import supertest from "supertest";
import {AppModule} from "../../src/app.module";
import {PeopleTestFixtures} from "../../src/people-test-fixtures/people-test-fixtures";
import {PeopleFileType} from "../../src/people/people-file-model";

describe('People file upload (e2e)', () => {
    const peopleTestFixtures: PeopleTestFixtures = new PeopleTestFixtures()
    const runtimeFiles = new RuntimeTestFilesDirectory(__dirname)

    let app: INestApplication;
    let fileUploader: SupertestFileUploader
    let fileDownloader: SupertestFileDownloader

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        fileUploader = peopleTestFixtures.fileUploader(app.getHttpServer())
        fileDownloader = peopleTestFixtures.fileDownloader(app.getHttpServer())
    });

    describe('Use static file', () => {
        it('should get static file', async () => {
            const staticFile: SpreadsheetTestFile = PeopleTestFixtures.get('people.csv')

            const expectedFileData: PeopleFileType = [
                ["First name", "Middle name", "Last name", "Age", "Type"],
                ["Anna", null, "Smith", 24, "User"],
                ["Mark", "John", "Johnson", 32, "Admin"]
            ];

            expect(staticFile.data).toEqual(expectedFileData)
        });

        it('should upload static file', async () => {
            const staticFile: SpreadsheetTestFile = PeopleTestFixtures.get('people.csv')

            const uploadResult = await fileUploader.upload(staticFile.path)

            expect(uploadResult.responseBody.fileId).toBeDefined()
        });
    });

    describe(`Create file in folder, upload and download back again.`, () => {
        it('Created file and downloaded one must have the same content', async () => {
            const generatedFilePath: string = runtimeFiles.path('people-generated.csv');
            const generatedFile: SpreadsheetTestFile = SpreadsheetTestFile.write<PeopleFileType>([
                ["First name", "Middle name", "Last name", "Age", "Type"],
                ["John", null, "Doe", 30, "Admin"],
                ["Adam", null, "Smith", 40, "Admin"],
                ["Rose", null, "Gatsby", 35, "User"]
            ], generatedFilePath)

            // upload the file, by executing http request to /upload endpoint
            const uploadedFileResult: FileUploadResult = await fileUploader.upload(generatedFile.path)

            // download the file, by executing http request to /download endpoint and using fileId query parameter
            const downloadedFile: TestFile = await fileDownloader.download({
                fileId: uploadedFileResult.responseBody.fileId
            })
            expect(generatedFile.data).toEqual(downloadedFile.data)
        });
    })

});
