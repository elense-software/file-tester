import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from './../src/app.module';
import {
    FileSystemFileCreator,
    SupertestFileDownloader,
    SupertestFileUploader, TestFile,
    TestFilesDirectory
} from "@elense/file-tester";
import supertest from "supertest";

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/ (GET)', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files')

        const fileCreator = new FileSystemFileCreator({
                headerRow: ["First name", "Last name", "Age", "Type"]
            }
        )

        let testFilePath = genFiles.path('test.xlsx');

        await fileCreator.create(testFilePath, [
            ["John", "Doe", 30, "Admin"],
            ["Adam", "Smith", 40, "Admin"],
            ["Rose", "Gatsby", 35, "User"]
        ])

        const file = fileCreator.readFile(testFilePath)
        console.table(file)


        const fileUploader = new SupertestFileUploader({
            appOrBaseUrl: app.getHttpServer(),
            endpointUrl: "/upload"
        })

        const uploadedFile = await fileUploader.upload(testFilePath)

        const fileDownloader = new SupertestFileDownloader({
            appOrBaseUrl: app.getHttpServer(),
            endpointUrl: "/download",
        })

        const donwloadedBuffer = await fileDownloader.download({
            customizeRequest(request: supertest.Test, downloadParameters: any): supertest.Test {
                return request.query({
                    fileId: uploadedFile.responseBody.fileId
                });
            }
        })

        const downloadedFile = TestFile.get(donwloadedBuffer)

        expect(downloadedFile).toBeDefined()
    });
});
