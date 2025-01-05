# file-tester
##### A set of utility functions to write clean tests utilizing file system: file directories, creating files, uploading them to server and downloading

### TestFilesDirectory

_/file-tester-example/test/test-files-directory.spec.ts_
```typescript
it('Directory contains the global path component', async () => {
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



### SpreadsheetTestFile

```typescript
it('SpreadsheetTestFile creation writes test.csv file to local filesystem', async () => {
    const testFilePath = directory.path(`test.csv`);

    const file: SpreadsheetTestFile = new SpreadsheetTestFile(
        [
            ["First name", "Last name", "Age", "Type"],
            ["John", "Doe", 30, "Admin"],
            ["Adam", "Smith", 40, "Admin"],
            ["Rose", "Gatsby", 35, "User"]
        ],
        null // Indicates that this file was not loaded from the path, it was built in memory.
    )

    file.write(testFilePath)
    expect(fs.existsSync(testFilePath)).toBe(true)

    const writtenFile = SpreadsheetTestFile.get(testFilePath)
    expect(writtenFile.data).toEqual(file.data)
});
```
- Carries Test file data - array of arrays of data and an optional file path, if it resides in local filesystem.
- Write file to local filesystem by `file.write(path)`
- `SpreadsheetTestFile.get(path: string | Buffer): SpreadsheetTestFile` - obtain the xlsx file from provided path or Buffer.
  

