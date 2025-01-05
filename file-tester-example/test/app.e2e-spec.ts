import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from './../src/app.module';
import {
    FileSystemFileCreator, SpreadsheetTestFile,
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
        describe.each([
            'csv',
            'xlsx'
        ])(`SupertestFileUploader and SupertestFileDownloader (%s)`, (fileType: string) => {
            it('Standalone file creation works properly %s', async () => {
                const testFilePath = directory.path(`test.${fileType}`);

                const file: SpreadsheetTestFile = new SpreadsheetTestFile(
                    [
                        ["First name", "Last name", "Age", "Type"],
                        ["John", "Doe", 30, "Admin"],
                        ["Adam", "Smith", 40, "Admin"],
                        ["Rose", "Gatsby", 35, "User"]
                    ]
                )

                file.write(testFilePath)
                file.print()

                const fileData: any[][] = file.data

                expect(fileData[3]).toEqual(["Rose", "Gatsby", 35, "User"])
                expect(fileData[1][2]).toEqual(30)
                expect(fileData[3][1]).toEqual('Gatsby')

                expect(fs.existsSync(testFilePath)).toBe(true)

                const writtenFile = SpreadsheetTestFile.get(testFilePath)

                expect(writtenFile.data).toEqual(file.data)
            });
        })
    })

    it('Directory creation works properly', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'test-specific-folder')

        genFiles.clear()
        expect(fs.existsSync(genFiles.directory)).toBe(false)

        genFiles.create()
        expect(fs.existsSync(genFiles.directory)).toBe(true)
        expect(genFiles.directory.endsWith('test-specific-folder')).toBe(true)
    });

    it('Directory contains the global path component', async () => {
        const folder = new TestFilesDirectory(__dirname, 'test-specific-folder')
        // folder.directory is an absolute path: /Users/radek/Documents/repos/file-tester/file-tester-example/test/_test-runtime/test-specific-folder

        folder.clear()
        folder.create()

        fs.writeFileSync(folder.path('test.txt'), 'test')

        expect(folder.directory.endsWith(`_test-runtime/test-specific-folder`)).toBe(true)
    });

    it('File creation works properly', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-2')
        const testFilePath = genFiles.path('test.csv');

        const fileCreator = new FileSystemFileCreator()

        const file: TestFile = await fileCreator.create(testFilePath, [
            ["First name", "Last name", "Age", "Type"],
            ["John", "Doe", 30, "Admin"],
            ["Adam", "Smith", 40, "Admin"],
            ["Rose", "Gatsby", 35, "User"]
        ])

        expect(fs.existsSync(file.path)).toBe(true)
    });

    it('File creation and upload works properly', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-23')
        const testFilePath = genFiles.path('test-23.csv');

        const fileCreator = new FileSystemFileCreator()

        const file: TestFile = await fileCreator.create(testFilePath, [
            ["First name", "Last name", "Age", "Type"],
            ["John", "Doe", 30, "Admin"],
            ["Adam", "Smith", 40, "Admin"],
            ["Rose", "Gatsby", 35, "User"]
        ])

        const response = await new SupertestFileUploader({}).upload(file.path, {
            appOrBaseUrl: app.getHttpServer(),
            endpointUrl: "/upload",
        })

        expect(response.isSuccessful).toEqual(true)
        expect(response.responseBody.fileId).toBeDefined()
    });

    it('File upload and download equals the same file content', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-3')
        const testFilePath = genFiles.path('test.csv');

        const fileCreator = new FileSystemFileCreator()

        const createdFile = await fileCreator.create(testFilePath, [
            ["First name", "Last name", "Age", "Type"],
            ["John", "Doe", 30, "Admin"],
            ["Adam", "Smith", 40, "Admin"],
            ["Rose", "Gatsby", 35, "User"]
        ])

        const file = fileCreator.readFile(createdFile.path)
        file.print()

        const fileUploader = new SupertestFileUploader({
            appOrBaseUrl: app.getHttpServer(),
            endpointUrl: "/upload"
        })

        const uploadedFile = await fileUploader.upload(testFilePath)

        const fileDownloader = new SupertestFileDownloader({
            appOrBaseUrl: app.getHttpServer(),
            endpointUrl: "/download",
        })

        const downloadedFile = await fileDownloader.download({
            customizeRequest(request: supertest.Test, downloadParameters: any): supertest.Test {
                return request.query({
                    fileId: uploadedFile.responseBody.fileId
                });
            }
        })

        expect(file.data).toEqual(downloadedFile.data)
    });
});
