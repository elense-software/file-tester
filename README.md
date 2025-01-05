# file-tester
##### A set of utility functions to write clean tests utilizing file system: file directories, creating files, uploading them to server and downloading

## Example E2E API test in NestJS:

Case - The server allows to upload files and returns unique identifier for each upload so that the files can be later downloaded.

```typescript
    // _describeWithFolder_ is a wrapper for describe which injects the object which prepares folder for test files
    describeWithFolder(`Create file in folder, upload and download back again.`, __dirname, 'e2e-upload-download', (directory: TestFilesDirectory) => {
        it('Created file and downloaded one must have the same content', async () => {

            // Build the path for file 'test.csv' in the preinitialized folder: __dirname/_test-runtime/e2e-upload-download/test.csv . _test-runtime is a configurable, project-wide, static segment
            const testFilePath = directory.path('test.csv');

            // write the file to local file system
            const createdFile: SpreadsheetTestFile = SpreadsheetTestFile.write([
                ["First name", "Last name", "Age", "Type"],
                ["John", "Doe", 30, "Admin"],
                ["Adam", "Smith", 40, "Admin"],
                ["Rose", "Gatsby", 35, "User"]
            ], testFilePath)

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
```

## TestFilesDirectory

_/file-tester-example/test/test-files-directory.spec.ts_
```typescript
it(`Creates '_test-runtime/test-specific-folder' directory relative to __dirname`, async () => {
    const folder = new TestFilesDirectory(__dirname, 'test-specific-folder')
    // if test file resides in `/file-tester-example/test` then folder.directory contains an absolute path: /file-tester-example/test/_test-runtime/test-specific-folder

    folder.clear()
    folder.create()

    fs.writeFileSync(folder.path('test.txt'), 'test') // a file is created at: /file-tester-example/test/_test-runtime/test-specific-folder/test.txt

    expect(folder.directory.endsWith(`_test-runtime/test-specific-folder`)).toBe(true)
});
```

_.gitignore_
```.gitignore
/**/_test-runtime
```

Effect:
- `folder` with absolute path: `/file-tester-example/test/_test-runtime/test-specific-folder` is cleared recursively and recreated.
- `folder.path('test.txt')` - allows to obtain a new path relative to the `folder`

> [!NOTE]
> All paths created with `TestFilesDirectory` contain **_test-runtime** segment. The proper pattern is added to .gitignore so no runtime test data will ever be commited to repo
This can be modified project-wise by static field `TestFilesDirectory.globalDirectoryPathComponent`.



## SpreadsheetTestFile

```typescript
    it('Define spreadsheet data, write to disk, fetch and access the data', async () => {
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
```
  

