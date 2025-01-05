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
import * as fs from "node:fs";

export const describeWithFolder = (name: string, basePath: string, folderName: string, tests: (directory: TestFilesDirectory) => void) => {
    const directory = new TestFilesDirectory(basePath, folderName);

    describe(name, () => {
        beforeAll(() => {
            directory.clear()
            directory.create()
        });

        tests(directory);
    });
};

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describeWithFolder('FileSystemFileCreator', __dirname, 'file-system-file-creator', (directory: TestFilesDirectory) => {
        it('Directory creation works properly', async () => {
            expect(fs.existsSync(directory.directory)).toBe(true)
        });
    })

    it('Directory creation works properly', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-1')

        expect(fs.existsSync(genFiles.directory)).toBe(true)
    });

    it('File creation works properly', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-2')

        const fileCreator = new FileSystemFileCreator({
                headerRow: ["First name", "Last name", "Age", "Type"]
            }
        )

        const testFilePath = genFiles.path('test.csv');

        await fileCreator.create(testFilePath, [
            ["John", "Doe", 30, "Admin"],
            ["Adam", "Smith", 40, "Admin"],
            ["Rose", "Gatsby", 35, "User"]
        ])

        expect(fs.existsSync(testFilePath)).toBe(true)
    });

    it('File upload and download equals the same file content', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-3')

        const fileCreator = new FileSystemFileCreator({
                headerRow: ["First name", "Last name", "Age", "Type"]
            }
        )

        let testFilePath = genFiles.path('test.csv');

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

        expect(file).toEqual(downloadedFile.jsonData)
    });
});
