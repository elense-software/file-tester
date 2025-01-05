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

  

