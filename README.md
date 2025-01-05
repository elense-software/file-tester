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


