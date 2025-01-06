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
import {FileSpecs} from "../../file-creator/concrete-creators/test-file";

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

                const inputFile: SpreadsheetTestFile = new SpreadsheetTestFile(
                    [
                        ["First name", "Last name", "Age", "Type"],
                        ["John", "Doe", 30, "Admin"],
                        ["Adam", "Smith", 40, "Admin"],
                        ["Rose", "Gatsby", 35, "User"]
                    ]
                )
                inputFile.write(testFilePath)

                const writtenFile: SpreadsheetTestFile = SpreadsheetTestFile.get(testFilePath)

                expect(writtenFile.data).toEqual(inputFile.data)

                const fileData: any[][] = writtenFile.data

                expect(fileData[3]).toEqual(["Rose", "Gatsby", 35, "User"])
                expect(fileData[1][2]).toEqual(30)
                expect(fileData[3][1]).toEqual('Gatsby')

                writtenFile.print()
            });
        })
    })

    it('File creation works properly', async () => {
        // define file content
        const inputFile: SpreadsheetTestFile = new SpreadsheetTestFile(
            [
                ["First name", "Last name", "Age", "Type"],
                ["John", "Doe", 30, "Admin"],
                ["Adam", "Smith", 40, "Admin"],
                ["Rose", "Gatsby", 35, "User"]
            ]
        )

        // use the data
        const lastNameOfAdam = inputFile.data[2][1]

        // write to local file system
        inputFile.write( __dirname + '/test.xlsx')

        // Fetch file by path
        const writtenFile: SpreadsheetTestFile = SpreadsheetTestFile.get(__dirname + '/test.xlsx')

        // compare files
        expect(writtenFile.data).toEqual(inputFile.data)
    });

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

    it('File creation with specs works properly', async () => {
        const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files-2')
        const testFilePath = genFiles.path('test.csv');


        type PeopleFileHeader = [string, string, string, string]
        type PeopleFileData = [string, string, number, string]

        type PeopleRegistryFileData = [
            PeopleFileHeader,
            ...PeopleFileData[]
        ]

        class PeopleRegistryFile implements FileSpecs<PeopleFileHeader> {
            readonly header: PeopleFileHeader = ['First name', 'Last name', 'Age', 'Type']
        }

        const inputFile: SpreadsheetTestFile = new SpreadsheetTestFile(
            [
                ["First name", "Last name", "Age", "Type"],
                ["John", "Doe", 30, "Admin"],
                ["Adam", "Smith", 40, "Admin"],
                ["Rose", "Gatsby", 35, "User"]
            ],
            null, new PeopleRegistryFile()
        )
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

    describeWithFolder(`Create file in folder, upload and download back again.`, __dirname, 'e2e-upload-download', (directory: TestFilesDirectory) => {
        it('Created file and downloaded one must have the same content', async () => {
            const testFilePath = directory.path('test.csv');

            type PeopleFileHeader = [string, string, string, string]
            type PeopleFileData = [string, string, number, string]

            type PeopleRegistryFileData = [
                PeopleFileHeader,
                ...PeopleFileData[]
            ]

            // write the file to local file system
            const createdFile: SpreadsheetTestFile = SpreadsheetTestFile.write<PeopleRegistryFileData>([
                ["First name", "Last name", "Age", "Type"],
                ["John", "Doe", 30, "Admin"],
                ["Adam", "Smith", 40, "Admin"],
                ["Rose", "Gatsby", 35, "User"]
            ], testFilePath)

            const arrayOfFiles: SpreadsheetTestFile<PeopleRegistryFileData>[] = []

            // prepare uploader with common props (can be overriden at upload method)
            const fileUploader = new SupertestFileUploader({
                appOrBaseUrl: app.getHttpServer(),
                endpointUrl: "/upload"
            })

            // upload the file, by executing http request to /upload endpoint
            const uploadedFileResult = await fileUploader.upload(createdFile.path)

            // prepare downloader with common props (can be overriden at download method)
            const fileDownloader = new SupertestFileDownloader({
                appOrBaseUrl: app.getHttpServer(),
                endpointUrl: "/download",
            })

            // download the file, by executing http request to /download endpoint and using fileId query parameter
            const downloadedFile = await fileDownloader.download({
                customizeRequest(request: supertest.Test, downloadParameters: any): supertest.Test {
                    return request.query({
                        fileId: uploadedFileResult.responseBody.fileId
                    });
                }
            })

            // compare that the content of created file and downloaded file is the same
            expect(createdFile.data).toEqual(downloadedFile.data)
        });
    })

});
